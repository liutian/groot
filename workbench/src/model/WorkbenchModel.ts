import { FormInstance } from "antd";

export default class WorkbenchModel {
  public widgetWindowRect: 'min' | 'full' | 'normal' | 'none' | { x?: number, y?: number, width?: number, height?: number } = 'min';
  public minSideWidth = 480;
  public loadComponent: 'doing' | 'notfound' | 'over' = 'doing';
  public iframeRef?: { current: HTMLIFrameElement };
  public component: Component;
  public iframePath = '';
  /**
 * 手动编码配置模式
 */
  public manualMode = false;
  /**
   * json模式
   */
  public jsonMode = false;
  /**
   * 配置块关联表单实例
   */
  public blockFormInstanceMap = new Map<number, FormInstance>();

  /**
   * 设计模式
   */
  public stageMode = false;

  init = (component: Component, iframeRef: { current: HTMLIFrameElement }, stageMode: boolean) => {
    this.loadComponent = 'over';
    this.iframeRef = iframeRef;
    this.component = component;
    this.stageMode = stageMode
    this.buildPropGroups();
  }

  /**
   * 配置项变动通知iframe更新
   */
  notifyIframe = (content: string) => {
    const props = content;

    this.iframeRef.current.contentWindow.postMessage({
      type: 'refresh',
      path: this.component.instance.path,
      metadata: {
        moduleName: this.component.componentName + '_module',
        packageName: this.component.packageName,
        componentName: this.component.componentName,
        // todo
        props
      }
    }, '*');
  }

  // todo
  public productStudioData = () => {
    const props: any[] = [];
    this.component.version.rootGroupList.forEach((group) => {
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

  private buildPropGroups() {
    this.component.version.rootGroupList = [];
    const rootGroupIds = this.component.version.groupList
      .filter(g => g.root)
      .sort((a, b) => a.order - b.order)
      .map(g => g.id);

    for (let i = 0; i < rootGroupIds.length; i++) {
      const groupId = rootGroupIds[i];
      const group = this.buildPropGroup(groupId);
      this.component.version.rootGroupList.push(group);
    }
  }

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
    } else {
      group.propBlockList = propBlockList;
    }

    const templateBlock = blocks.find(b => b.id === group.templateBlockId);
    if (group.struct === 'List' && templateBlock) {
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
          const relativeGroup = this.buildPropGroup(item.valueOfGroupId, store);

          item.valueOfGroup = relativeGroup;
          item.templateBlock = relativeGroup.templateBlock;
        } else if (item.type === 'Item') {
          const relativeGroup = this.buildPropGroup(item.valueOfGroupId, store);

          item.valueOfGroup = relativeGroup;
          item.directBlock = relativeGroup.propBlockList[0];
        }
      }
    }

    return group;
  }

  getPropBlock = (blockId: number): PropBlock => {
    const rootGroupList = this.component.version.rootGroupList;
    for (let index = 0; index < rootGroupList.length; index++) {
      const rootGroup = rootGroupList[index];
      const result = this.getProp<PropBlock>(blockId, 'block', rootGroup);
      if (result) {
        return result;
      }
    }

    return null;
  }

  getPropGroup = (groupId: number): PropGroup => {
    const rootGroupList = this.component.version.rootGroupList;
    for (let index = 0; index < rootGroupList.length; index++) {
      const rootGroup = rootGroupList[index];
      const result = this.getProp<PropGroup>(groupId, 'group', rootGroup);
      if (result) {
        return result;
      }
    }

    return null;
  }

  getProp = <T>(id: number, type: 'block' | 'group' | 'item', group: PropGroup): T => {
    if (type === 'group' && group.id === id) {
      return group as any as T;
    }

    if (type === 'block' && group.struct === 'List' && id === group.templateBlock.id) {
      return group.templateBlock as any as T;
    }

    const blockList = group.propBlockList;
    for (let index = 0; index < blockList.length; index++) {
      const block = blockList[index];
      if (type === 'block') {
        return block as any as T;
      }

      const itemList = block.propItemList;
      for (let itemIndex = 0; itemIndex < itemList.length; itemIndex++) {
        const item = itemList[itemIndex];
        if (type === 'item') {
          return item as any as T;
        }

        if (item.type === 'List' || item.type === 'Item') {
          return this.getProp<T>(id, type, item.valueOfGroup);
        }
      }
    }

    return null;
  }
}