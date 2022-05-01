import { uuid } from "@util/utils";
import { FormInstance } from "antd";

export default class Studio {
  /**
   * tab激活的分组
   */
  public activeGroupId?: number;
  /**
   * 当前配置组
   */
  public currSettingStudioGroup?: CodeMetaStudioPropGroup;
  /**
   * 当前配置块
   */
  public currSettingStudioBlock?: CodeMetaStudioPropBlock;
  /**
   * 当前配置项
   */
  public currSettingStudioItem?: CodeMetaStudioPropItem;

  /**
   * 当前组件配置对象
   */
  public codeMetaStudio = {} as CodeMetaStudio;
  /**
   * 设置配置项模式
   */
  public settingMode = false;
  /**
   * 手动编码配置模式
   */
  public manualMode = false;
  /**
   * 配置块所属表单实例
   */
  public blockFormInstanceMap = new Map<number, FormInstance>();
  /**
   * 配置项变动通知iframe更新
   */
  public notifyIframe?: Function;
  /**
  * 当前正在配置的配置块或者配置项需要插入的位置
  */
  public currSettingInsertIndex: number = -1;

  public handUpStudioItemStack: CodeMetaStudioPropItem[] = [];

  public innerTempStudioGroupMap = new Map<number, CodeMetaStudioPropGroup>();

  public init(codeMetaStudio: CodeMetaStudio) {
    this.codeMetaStudio = codeMetaStudio;
    this.buildPropGroups(codeMetaStudio);
    this.activeGroupId = codeMetaStudio.propGroups[0]?.id;
    this.settingMode = true;
  }

  // todo
  public productStudioData = () => {
    const props: any[] = [];
    this.codeMetaStudio.propGroups.forEach((group) => {
      group.propBlocks.forEach((block) => {
        const values = this.blockFormInstanceMap.get(block.id)?.getFieldsValue();
        block.propItems.forEach((item) => {
          props.push({
            key: item.propKey,
            defaultValue: values[item.propKey]
          })
        })
      })
    })
    this.notifyIframe!(JSON.stringify(props));
  }

  public moveStudioBlock = (group: CodeMetaStudioPropGroup, originIndex: number, up: boolean) => {
    const [moveBlock] = group.propBlocks.splice(originIndex, 1);
    if (up) {
      group.propBlocks.splice(originIndex - 1, 0, moveBlock!);
    } else {
      group.propBlocks.splice(originIndex + 1, 0, moveBlock!);
    }
  }

  public moveStudioGroup = (dragId: string, hoverId: string) => {
    if (dragId === hoverId) {
      return;
    }

    const groups = this.codeMetaStudio.propGroups;

    const drag = groups.find(g => g.id === +dragId)!;
    const hoverIndex = groups.findIndex(g => g.id === +hoverId);
    const dragIndex = groups.findIndex(g => g.id === +dragId);
    const currentIndex = groups.findIndex(g => g.id === this.activeGroupId);

    groups.splice(hoverIndex, 0, drag);

    if (hoverIndex < dragIndex) {

      groups.splice(dragIndex + 1, 1);
      if (currentIndex >= hoverIndex && currentIndex < dragIndex) {
        this.activeGroupId = groups[currentIndex + 1]?.id;
      } else if (currentIndex === dragIndex) {
        this.activeGroupId = +hoverId;
      }
    } else {
      if (currentIndex === dragIndex && currentIndex < hoverIndex) {
        this.activeGroupId = groups[currentIndex - 1]?.id;
      } else if (currentIndex === dragIndex) {
        this.activeGroupId = groups[hoverIndex - 1]?.id;
      }
      groups.splice(dragIndex, 1);
    }
  }

  public moveStudioItem = (block: CodeMetaStudioPropBlock, originIndex: number, up: boolean) => {
    const [moveItem] = block.propItems.splice(originIndex, 1);
    if (up) {
      block.propItems.splice(originIndex - 1, 0, moveItem!);
    } else {
      block.propItems.splice(originIndex + 1, 0, moveItem!);
    }
  }

  public updateOrAddStudioGroup = (group: CodeMetaStudioPropGroup) => {
    const newGroup = Object.assign(this.currSettingStudioGroup, group);

    if (newGroup.id) {
      const groupIndex = this.codeMetaStudio.propGroups.findIndex(g => g.id === newGroup.id);
      this.codeMetaStudio.propGroups.splice(groupIndex, 1, { ...newGroup });
    } else {
      const groupId = uuid();
      newGroup.id = groupId;
      this.codeMetaStudio.propGroups.push(newGroup);
      this.activeGroupId = groupId;

      newGroup.propBlocks.forEach((block) => {
        block.id = uuid();
        block.groupId = groupId;
        block.propItems.forEach((item) => {
          item.id = uuid();
          item.groupId = groupId;
          item.blockId = block.id;
        })
      })
    }
    this.currSettingStudioGroup = undefined;
  }

  public updateOrAddStudioBlock = (block: CodeMetaStudioPropBlock) => {
    const newBlock = Object.assign(this.currSettingStudioBlock, block);
    const group = this.getStudioGroup(newBlock.groupId!);

    if (newBlock.id) {
      const blockIndex = group?.propBlocks.findIndex(b => b.id === newBlock.id);
      group?.propBlocks.splice(blockIndex!, 1, { ...newBlock });
    } else {
      const blockId = uuid();
      newBlock.id = blockId;
      group?.propBlocks.splice(this.currSettingInsertIndex + 1, 0, newBlock);

      newBlock.propItems.forEach((item) => {
        item.id = uuid();
        item.blockId = blockId;
        item.groupId = newBlock.groupId;
      })
    }
    this.currSettingStudioBlock = undefined;
  }

  public updateOrAddStudioItem = (item: CodeMetaStudioPropItem) => {
    const newItem = Object.assign(this.currSettingStudioItem, item);

    if (!['select', 'radio', 'checkbox'].includes(newItem.type)) {
      newItem.options = undefined;
    }

    if (newItem.type === 'array-object') {
      const itemChild = {
        id: uuid(),
        label: '配置项1',
        propKey: 'prop_001',
        type: 'input',
        span: 24
      } as CodeMetaStudioPropItem;
      const blockChild = {
        id: uuid(),
        name: '配置块1',
        propItems: [itemChild]
      } as CodeMetaStudioPropBlock;
      const groupChild = {
        id: uuid(),
        name: '',
        propBlocks: [blockChild]
      } as CodeMetaStudioPropGroup;

      item.blockId = blockChild.id;
      item.groupId = groupChild.id;
      blockChild.groupId = groupChild.id;
      newItem.valueOfGroup = groupChild;
      newItem.valueOfGroupId = groupChild.id;

      newItem.templateBlock = JSON.parse(JSON.stringify(blockChild));
      newItem.templateBlock!.id = uuid();
      newItem.templateBlock?.propItems.forEach((item) => {
        item.id = uuid();
        item.blockId = newItem.templateBlock!.id;
      });
    }

    const block = this.getStudioBlock(newItem.blockId!);
    if (newItem.id) {
      const itemIndex = block?.propItems.findIndex(item => item.id === newItem.id);
      block?.propItems.splice(itemIndex!, 1, { ...newItem });
    } else {
      const id = uuid();
      block?.propItems.splice(this.currSettingInsertIndex + 1, 0, { ...newItem, id });
    }

    this.currSettingStudioItem = undefined;

    setTimeout(() => {
      this.productStudioData();
    }, 100)
  }

  public delGroup = (groupId: number) => {
    const index = this.codeMetaStudio.propGroups.findIndex(g => g.id === groupId);
    this.codeMetaStudio.propGroups.splice(index, 1);
    if (this.activeGroupId === groupId) {
      this.activeGroupId = this.codeMetaStudio.propGroups[0]?.id;
    }
  }

  public switchActiveGroup = (id: number) => {
    const activeItem = this.codeMetaStudio.propGroups.find(g => g.id === id);
    if (activeItem) {
      this.activeGroupId = id;
    }
  }

  public switchSettingMode = () => {
    if (this.settingMode) {
      this.settingMode = false;
      this.codeMetaStudio.propGroups.forEach((group) => {
        group.propBlocks.forEach((block) => {
          const values = this.blockFormInstanceMap.get(block.id)?.getFieldsValue();
          block.propItems.forEach((item) => {
            item.defaultValue = values[item.propKey];
            item.value = null;
          });
        })
      })
    } else {
      this.settingMode = true;
    }
  }

  public switchManualMode = () => {
    if (this.manualMode) {
      this.manualMode = false;
    } else {
      this.manualMode = true;
    }
  }

  public pushHandUpStudioItem = (item: CodeMetaStudioPropItem) => {
    this.handUpStudioItemStack?.push(item);
  }

  public popHandUpStudioItem = (group: CodeMetaStudioPropGroup, templateBlockOfArrayObject: CodeMetaStudioPropBlock) => {
    const item = this.handUpStudioItemStack.pop();
    if (item) {
      item.valueOfGroup = JSON.parse(JSON.stringify(group));
      item.templateBlock = JSON.parse(JSON.stringify(templateBlockOfArrayObject));
    }
  }

  public getStudioGroup = (groupId: number) => {
    let group = this.codeMetaStudio.propGroups.find((group) => {
      return group.id === groupId;
    })

    return group || this.innerTempStudioGroupMap.get(groupId);
  }

  public getStudioBlock = (blockId: number) => {
    for (let groupIndex = 0; groupIndex < this.codeMetaStudio.propGroups.length; groupIndex++) {
      const group = this.codeMetaStudio.propGroups[groupIndex];
      for (let blockIndex = 0; blockIndex < group!.propBlocks.length; blockIndex++) {
        const block = group?.propBlocks[blockIndex];
        if (block?.id === blockId) {
          return block;
        }
      }
    }

    const tempGroups = [...this.innerTempStudioGroupMap.values()];
    for (let groupIndex = 0; groupIndex < tempGroups.length; groupIndex++) {
      const group = tempGroups[groupIndex];
      for (let blockIndex = 0; blockIndex < group!.propBlocks.length; blockIndex++) {
        const block = group?.propBlocks[blockIndex];
        if (block?.id === blockId) {
          return block;
        }
      }
    }

    return undefined;
  }

  public showStudioBlockSettinngForCreate = (relativeBlock: CodeMetaStudioPropBlock, group: CodeMetaStudioPropGroup, inner: boolean, innerTemplateBlock: CodeMetaStudioPropBlock) => {
    if (inner) {
      const newBlock = JSON.parse(JSON.stringify(innerTemplateBlock)) as CodeMetaStudioPropBlock;
      newBlock.id = 0;
      newBlock.name = `配置块${group.propBlocks.length + 1}`;
      newBlock.groupId = group.id;
      this.currSettingStudioBlock = newBlock;
    } else {
      this.currSettingStudioBlock = {
        id: 0,
        name: '配置块' + group.propBlocks.length,
        groupId: group.id,
        propItems: [{
          id: 0,
          type: 'input',
          label: '配置项1',
          propKey: 'prop1',
          groupId: 0,
          blockId: 0,
          span: 24
        }],
      };
    }
    this.currSettingInsertIndex = group.propBlocks.findIndex(b => b.id === relativeBlock.id);
  }

  public createCodemeta(codeMetaStudio: CodeMetaStudio) {
    const codemetas = [] as CodeMeta[];
    for (let groupIndex = 0; groupIndex < codeMetaStudio.propGroups.length; groupIndex++) {
      const group = codeMetaStudio.propGroups[groupIndex]!;
      this.createCodemetaFromGroup(group, codemetas, '');
    }
    return codemetas;
  }

  private createCodemetaFromGroup(group: CodeMetaStudioPropGroup, codemetas: CodeMeta[], contextKey = '') {
    const blocks = group.propBlocks;
    const groupPropKey = group.propKey || '';
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex]!;
      const blockPropKey = block.propKey || '';
      for (let itemIndex = 0; itemIndex < block.propItems.length; itemIndex++) {
        const item = block.propItems[itemIndex]!;
        const itemPropKey = item.propKey || '';
        const keyArr = [contextKey];

        if (group.relativeItemId) {
          keyArr.push(`[${blockIndex}]`);
        } else {
          keyArr.push(groupPropKey, blockPropKey);
        }

        if (!group.relativeItemId && block.isRootPropKey) {
          keyArr.length = 0;
          keyArr.push(blockPropKey);
        }

        keyArr.push(itemPropKey);

        if (!group.relativeItemId && item.isRootPropKey) {
          keyArr.length = 0;
          keyArr.push(itemPropKey);
        }

        const key = keyArr.filter(k => !!k).join('.');
        codemetas.push({
          key,
          type: item.type,
          defaultValue: item.value || item.defaultValue
        });
        if (item.type === 'array-object') {
          this.createCodemetaFromGroup(item.valueOfGroup!, codemetas, key);
        }
      }
    }
  }



  private buildPropGroups(codeMetaStudio: CodeMetaStudio) {
    codeMetaStudio.propGroups = [];
    for (let i = 0; i < codeMetaStudio.propGroupIds.length; i++) {
      const groupId = codeMetaStudio.propGroupIds[i]!;
      const group = this.buildStudioGroup(groupId);
      codeMetaStudio.propGroups.push(group);
    }
  }

  private buildStudioGroup(groupId: number) {
    const group = this.codeMetaStudio.allGroups.find(g => g.id === groupId);
    if (!group) {
      throw new Error(`can not find group[${groupId}]`);
    }

    const blocks = this.codeMetaStudio.allBlocks.filter(b => b.groupId === groupId);
    group.propBlocks = blocks;
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex]!;
      const items = this.codeMetaStudio.allItems.filter(i => i.groupId === groupId && i.blockId === block.id);
      block.propItems = items;

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const item = items[itemIndex]!;
        if (item.type === 'array-object') {
          const relativeGroup = this.buildStudioGroup(item.valueOfGroupId!);
          item.valueOfGroup = relativeGroup;
          const relativeBlock = relativeGroup.propBlocks.find(b => b.id === item.templateBlockId);
          item.templateBlock = relativeBlock;
          relativeGroup.propBlocks = relativeGroup.propBlocks.filter(b => b.id !== item.templateBlockId)
        }
      }
    }

    return group;
  }

}
