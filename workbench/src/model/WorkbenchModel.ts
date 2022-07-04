import { FormInstance } from "antd";

export default class WorkbenchModel {
  public loadComponent: 'doing' | 'notfound' | 'over' = 'doing';
  /**
   * 窗口部件缩放大小
   */
  public widgetWindowRect: 'min' | 'full' | 'normal' | 'none' | { x?: number, y?: number, width?: number, height?: number } = 'min';
  /**
   * 侧边栏最小拖拽最小宽度
   */
  public minSideWidth = 480;
  public iframeRef?: { current: HTMLIFrameElement };
  public iframePath = '';
  /**
   * 组件信息
   */
  public component: Component;
  /**
   * 配置块关联表单实例，方便统一搜集所有配置项信息
   */
  public blockFormInstanceMap = new Map<number, FormInstance>();
  /**
   * 组件设计模式
   */
  public designMode = false;
  /**
    * 编码配置模式
    */
  public manualMode = false;
  /**
   * json模式
   */
  public jsonMode = false;

  public rootGroupList: PropGroup[] = [];

  public currEnv: 'dev' | 'qa' | 'pl' | 'online' = 'dev';

  public init = (component: Component, iframeRef: { current: HTMLIFrameElement }, designMode: boolean) => {
    this.loadComponent = 'over';
    this.iframeRef = iframeRef;
    this.component = component;
    this.designMode = designMode
    this.buildPropTree();
    console.log('prop tree built out  ', this.rootGroupList);

    if (!designMode) {
      const releaseId = this.component.release.id;
      const project = this.component.project;
      if (releaseId === project.devRelease.id) {
        this.currEnv = 'dev';
      } else if (releaseId === project.qaRelease.id) {
        this.currEnv = 'qa';
      } else if (releaseId === project.plRelease.id) {
        this.currEnv = 'pl';
      } else if (releaseId === project.onlineRelease.id) {
        this.currEnv = 'online';
      }
    }
  }

  /**
   * 配置项变动通知iframe更新
   */
  notifyIframe = (content: string) => {
    // const props = content;

    // this.iframeRef.current.contentWindow.postMessage({
    //   type: 'refresh',
    //   path: this.component.instance.path,
    //   metadata: {
    //     moduleName: this.component.componentName + '_module',
    //     packageName: this.component.packageName,
    //     componentName: this.component.componentName,
    //     // todo
    //     props
    //   }
    // }, '*');
  }

  // todo
  public productStudioData = () => {
    const props: any[] = [];
    this.rootGroupList.forEach((group) => {
      group.propBlockList.forEach((block) => {
        const values = this.blockFormInstanceMap.get(block.id).getFieldsValue();
        block.propItemList.forEach((item) => {
          props.push({
            key: item.propKey,
            defaultValue: values ? values[item.propKey] : item.defaultValue
          })
        })
      })
    })
    this.notifyIframe(JSON.stringify(props));
  }

  /**
   * 构建属性树
   */
  private buildPropTree() {
    const rootGroupIds = this.component.version.groupList
      .filter(g => g.root)
      .sort((a, b) => a.order - b.order)
      .map(g => g.id);

    for (let i = 0; i < rootGroupIds.length; i++) {
      const groupId = rootGroupIds[i];
      const group = this.buildPropGroup(groupId);
      this.rootGroupList.push(group);
    }
  }

  /**
   * 构建一个属性配置分组
   * @param groupIdOrObj 分组ID或者组对象
   * @param store 数据源
   * @returns 构建好的配置分组
   */
  public buildPropGroup(groupIdOrObj: number | PropGroup,
    store: { groupList: PropGroup[], blockList: PropBlock[], itemList: PropItem[] } = this.component.version) {
    let group: PropGroup;
    if (typeof groupIdOrObj === 'number') {
      group = store.groupList.find(g => g.id === groupIdOrObj)!;
      if (!group) {
        throw new Error(`can not find group[${groupIdOrObj}]`);
      }
    } else {
      group = groupIdOrObj;
    }

    const blocks = store.blockList
      .filter(b => b.groupId === group.id)
      .sort((a, b) => a.order - b.order)

    const propBlockList = blocks.filter(b => b.id !== group.templateBlockId);

    if (group.propBlockList?.length) {
      group.propBlockList.push(...propBlockList);
      group.expandBlockIdList.push(...propBlockList.map(b => b.id));
    } else {
      group.propBlockList = propBlockList;
      group.expandBlockIdList = propBlockList.map(b => b.id);
    }

    // 不要从blocks中找模版，有可能存在同一个模版被多处使用的情况
    let templateBlock = store.blockList.find(b => b.id === group.templateBlockId);
    if (group.struct === 'List') {
      if (!templateBlock) {
        templateBlock = this.getPropBlock(group.templateBlockId);
      }
      if (!templateBlock) {
        throw new Error(`not found templateBlock id:${group.templateBlockId}`);
      }
      group.templateBlock = templateBlock;
    }

    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex];
      const items = store.itemList
        .filter(i => i.groupId === group.id && i.blockId === block.id)
        .sort((a, b) => a.order - b.order)

      if (block.propItemList?.length) {
        block.propItemList.push(...items);
      } else {
        block.propItemList = items;
      }

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const item = items[itemIndex];
        if (item.type === 'List') {
          const valueOfGroup = this.buildPropGroup(item.valueOfGroupId, store);
          item.valueOfGroup = valueOfGroup;
          item.templateBlock = valueOfGroup.templateBlock;
        } else if (item.type === 'Item') {
          const valueOfGroup = this.buildPropGroup(item.valueOfGroupId, store);
          item.valueOfGroup = valueOfGroup;
          item.directBlock = valueOfGroup.propBlockList[0];
        } else if (item.type === 'Hierarchy') {
          const valueOfGroup = this.buildPropGroup(item.valueOfGroupId, store);
          item.valueOfGroup = valueOfGroup;
        }
      }
    }

    return group;
  }

  /**
   * 根据ID在属性树中查找对应配置块对象
   * @param blockId 配置块id
   * @returns 配置块对象
   */
  getPropBlock = (blockId: number): PropBlock => {
    return this.getPropBlockOrGroup(blockId, 'block');
  }

  /**
   * 根据ID在属性树中查找对应配置组对象
   * @param groupId 配置组ID
   * @returns 配置组对象
   */
  getPropGroup = (groupId: number): PropGroup => {
    return this.getPropBlockOrGroup(groupId, 'group');
  }

  getPropBlockOrGroup = (id: number, type: 'group' | 'block') => {
    for (let index = 0; index < this.rootGroupList.length; index++) {
      const rootGroup = this.rootGroupList[index];
      const result = this.getProp(id, type, rootGroup);
      if (result) {
        return result;
      }
    }

    return null;
  }

  // 使用范型会导致sourceMap信息丢失
  getProp = (id: number, type: 'block' | 'group' | 'item', group: PropGroup) => {
    if (type === 'group' && group.id === id) {
      return group;
    }

    if (type === 'block' && group.struct === 'List' && id === group.templateBlock.id) {
      return group.templateBlock;
    }

    const blockList = [...group.propBlockList];

    if (group.struct === 'List') {
      blockList.push(group.templateBlock);
    }

    for (let index = 0; index < blockList.length; index++) {
      const block = blockList[index];
      if (type === 'block' && block.id === id) {
        return block;
      }

      const itemList = block.propItemList;
      for (let itemIndex = 0; itemIndex < itemList.length; itemIndex++) {
        const item = itemList[itemIndex];
        if (type === 'item' && item.id === id) {
          return item;
        }

        if (item.type === 'List' || item.type === 'Item' || item.type === 'Hierarchy') {
          if (item.valueOfGroup) {
            const result = this.getProp(id, type, item.valueOfGroup);
            if (result) {
              return result;
            }
          } else {
            // 部分item可能已经挂在到rootGroup但是valueOfGroup还没初始化完成
            console.warn(`valueOfGroup can not empty itemId: ${item.id}`);
          }
        }
      }
    }

    return null;
  }
}