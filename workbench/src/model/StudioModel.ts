import { autoIncrementForName, uuid } from "@util/utils";
import { serverPath } from "config";
import WorkbenchModel from "./WorkbenchModel";

export default class StudioModel {
  /**
   * 当前激活分组的ID
   */
  public activeGroupId?: number;
  /**
   * 当前配置组
   */
  public currSettingPropGroup?: PropGroup;
  /**
   * 当前配置块
   */
  public currSettingPropBlock?: PropBlock;
  /**
   * 当前配置项
   */
  public currSettingPropItem?: PropItem;

  public propItemStack: PropItem[] = [];

  public settingModalLoading = false;

  public workbench: WorkbenchModel;

  public init(workbench: WorkbenchModel) {
    this.workbench = workbench;
    this.activeGroupId = this.workbench.rootGroupList[0].id;
  }

  public toggleTemplateBlockDesignMode = (group: PropGroup) => {
    group.templateBlockDesignMode = !group.templateBlockDesignMode;
    if (group.root && this.propItemStack.length) {
      this.popPropItemStack(this.propItemStack[0]);
    } else {
      const index = this.propItemStack.findIndex(i => i.valueOfGroupId === group.id);
      if (index !== -1 && index < this.propItemStack.length - 1) {
        this.popPropItemStack(this.propItemStack[index + 1]);
      }
    }
  }

  public movePropBlock = (group: PropGroup, originIndex: number, up: boolean) => {
    const originBlock = group.propBlockList[originIndex];
    const targetId = up ? group.propBlockList[originIndex - 1].id : group.propBlockList[originIndex + 1].id;

    fetch(`${serverPath}/move/position`, {
      body: JSON.stringify({
        originId: originBlock.id,
        targetId,
        type: 'block'
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(r => r.json()).then(() => {
      if (up) {
        const targetBlock = group.propBlockList[originIndex - 1];
        group.propBlockList[originIndex - 1] = originBlock;
        group.propBlockList[originIndex] = targetBlock;
      } else {
        const targetBlock = group.propBlockList[originIndex + 1];
        group.propBlockList[originIndex + 1] = originBlock;
        group.propBlockList[originIndex] = targetBlock;
      }
    });
  }

  public movePropGroup = (dragId: string, hoverId: string) => {
    if (dragId === hoverId) {
      return;
    }

    fetch(`${serverPath}/move/position`, {
      body: JSON.stringify({
        originId: dragId,
        targetId: hoverId === '__add' ? null : hoverId,
        type: 'group'
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(r => r.json()).then(() => {
      const groups = this.workbench.rootGroupList;

      const drag = groups.find(g => g.id === +dragId)!;
      const hoverIndex = hoverId === '__add' ? groups.length : groups.findIndex(g => g.id === +hoverId);
      const dragIndex = groups.findIndex(g => g.id === +dragId);
      const currentIndex = groups.findIndex(g => g.id === this.activeGroupId);

      groups.splice(hoverIndex, 0, drag);

      if (hoverIndex < dragIndex) {
        groups.splice(dragIndex + 1, 1);
        if (currentIndex >= hoverIndex && currentIndex < dragIndex) {
          this.activeGroupId = groups[currentIndex + 1].id;
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
    })
  }

  public movePropItem = (block: PropBlock, originIndex: number, up: boolean) => {
    const originItem = block.propItemList[originIndex];
    const targetId = up ? block.propItemList[originIndex - 1].id : block.propItemList[originIndex + 1].id;

    fetch(`${serverPath}/move/position`, {
      body: JSON.stringify({
        originId: originItem.id,
        targetId,
        type: 'item'
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(r => r.json()).then((result: { data: { originId: number, targetId: number, blockId: number }[] }) => {
      for (let index = 0; index < result.data.length; index++) {
        const { blockId } = result.data[index];
        const block = this.workbench.getPropBlock(blockId);
        if (up) {
          const targetItem = block.propItemList[originIndex - 1];
          block.propItemList[originIndex - 1] = originItem;
          block.propItemList[originIndex] = targetItem;
        } else {
          const targetItem = block.propItemList[originIndex + 1];
          block.propItemList[originIndex + 1] = originItem;
          block.propItemList[originIndex] = targetItem;
        }
      }
    });
  }

  /**
   * 添加或者更新配置组
   * @param group 配置组
   */
  public updateOrAddPropGroup = (group: PropGroup) => {
    const newGroup = Object.assign(this.currSettingPropGroup, group);
    newGroup.componentId = this.workbench.component.id;
    newGroup.componentVersionId = this.workbench.component.version.id;

    this.settingModalLoading = true;
    if (newGroup.id) {
      fetch(`${serverPath}/group/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroup)
      }).then(r => r.json()).then(() => {
        let groupIndex = this.workbench.rootGroupList.findIndex(g => g.id === newGroup.id);
        this.workbench.rootGroupList.splice(groupIndex, 1, newGroup);
        this.settingModalLoading = false;
        this.currSettingPropGroup = undefined;
      })
    } else {
      fetch(`${serverPath}/group/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroup)
      }).then(r => r.json()).then((result: { data: PropGroup }) => {
        const groupDB = result.data;
        // todo
        groupDB.expandBlockIdList = [];
        this.workbench.rootGroupList.push(groupDB);
        this.activeGroupId = groupDB.id;

        if (newGroup.struct === 'List') {
          groupDB.templateBlock = groupDB.propBlockList.find(b => b.id === groupDB.templateBlockId);
          groupDB.propBlockList.length = 0;
        }

        this.settingModalLoading = false;
        this.currSettingPropGroup = undefined;
      })
    }
  }

  public updateOrAddPropBlock = (block: PropBlock) => {
    const newBlock = Object.assign(this.currSettingPropBlock, block);
    const group = this.workbench.getPropGroup(newBlock.groupId);

    this.settingModalLoading = true;
    if (newBlock.id) {
      fetch(`${serverPath}/block/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBlock)
      }).then(r => r.json()).then(() => {
        let blockIndex = group.propBlockList.findIndex(b => b.id === newBlock.id);
        group.propBlockList.splice(blockIndex, 1, newBlock);
        this.settingModalLoading = false;
        this.currSettingPropBlock = undefined;
      });
    } else {
      fetch(`${serverPath}/block/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBlock)
      }).then(r => r.json()).then((result: { data: PropBlock }) => {
        group.propBlockList.push(result.data);
        // todo
        group.expandBlockIdList.push(result.data.id);

        this.settingModalLoading = false;
        this.currSettingPropBlock = undefined;
      })

    }
  }

  public addBlockFromTemplate = (groupId: number,) => {
    fetch(`${serverPath}/block/addFromTemplate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        groupId
      })
    }).then(r => r.json()).then((result: { data: { groupList: PropGroup[], blockList: PropBlock[], itemList: PropItem[] } }) => {
      const group = this.workbench.getPropGroup(groupId);
      this.workbench.buildPropGroup(group, {
        groupList: result.data.groupList,
        blockList: result.data.blockList,
        itemList: result.data.itemList
      });
    })
  }

  public updateOrAddPropItem = (item: PropItem) => {
    const newItem = Object.assign(this.currSettingPropItem, item);

    if (!['Select', 'Radio', 'Checkbox'].includes(newItem.type)) {
      newItem.optionList = undefined;
    }

    this.settingModalLoading = true;
    if (newItem.id) {
      fetch(`${serverPath}/item/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      }).then(r => r.json()).then((result: { data: PropItem[] }) => {
        for (let index = 0; index < result.data.length; index++) {
          const propItem = result.data[index];
          const block = this.workbench.getPropBlock(propItem.blockId);
          let itemIndex = block.propItemList.findIndex(item => item.id === propItem.id);
          block.propItemList.splice(itemIndex, 1, propItem);
        }

        this.settingModalLoading = false;
        this.currSettingPropItem = undefined;
      });
    } else {
      fetch(`${serverPath}/item/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      }).then(r => r.json()).then((result: { data: { newItem: PropItem, valueOfGroup: PropGroup, templateBlock: PropBlock }[] }) => {
        for (let index = 0; index < result.data.length; index++) {
          const data = result.data[index];
          this.addPropItemFn(data);
        }

        this.settingModalLoading = false;
        this.currSettingPropItem = undefined;
      })
    }

    // setTimeout(() => {
    //   this.workbench.productStudioData();
    // }, 100)
  }

  private addPropItemFn = (data: { newItem: PropItem, valueOfGroup: PropGroup, templateBlock: PropBlock }) => {
    const block = this.workbench.getPropBlock(data.newItem.blockId);
    block.propItemList.push(data.newItem);
    if (data.newItem.type === 'List') {
      const valueOfGroup = data.valueOfGroup;
      const templateBlock = data.templateBlock;

      valueOfGroup.propBlockList.length = 0;
      valueOfGroup.templateBlock = templateBlock;
      data.newItem.templateBlock = templateBlock;
      data.newItem.valueOfGroup = valueOfGroup;
    } else if (data.newItem.type === 'Item') {
      const valueOfGroup = data.valueOfGroup;
      data.newItem.directBlock = valueOfGroup.propBlockList[0];
      data.newItem.valueOfGroup = valueOfGroup;
    }
  }

  public delGroup = (groupId: number) => {
    fetch(`${serverPath}/group/remove/${groupId}`).then(() => {
      const index = this.workbench.rootGroupList.findIndex(g => g.id === groupId);

      this.workbench.rootGroupList.splice(index, 1);

      if (this.activeGroupId === groupId) {
        this.activeGroupId = this.workbench.rootGroupList[0]?.id;
      }
    })
  }

  public delBlock = (blockId: number, group: PropGroup) => {
    fetch(`${serverPath}/block/remove/${blockId}`).then(() => {
      let blockIndex = group.propBlockList.findIndex(b => b.id === blockId);
      group.propBlockList.splice(blockIndex, 1);
    })
  }

  public delItem = (itemId: number) => {
    fetch(`${serverPath}/item/remove/${itemId}`).then(r => r.json()).then((result: { data: PropItem[] }) => {
      for (let index = 0; index < result.data.length; index++) {
        const itemData = result.data[index]!;
        const block = this.workbench.getPropBlock(itemData.blockId);
        let itemIndex = block.propItemList.findIndex(item => item.id === itemData.id);
        block.propItemList.splice(itemIndex, 1);
      }
    })
  }

  public switchActiveGroup = (id: number) => {
    const group = this.workbench.rootGroupList.find(g => g.id === id);
    if (group) {
      const preActiveGroup = this.workbench.rootGroupList.find(g => g.id === this.activeGroupId);
      preActiveGroup.templateBlockDesignMode = false;
      this.activeGroupId = id;
    }
  }

  public switchDesignMode = () => {
    this.workbench.jsonMode = false;
    this.workbench.manualMode = false;
    if (this.workbench.designMode) {
      this.workbench.designMode = false;
      this.workbench.rootGroupList.forEach((group) => {
        group.propBlockList.forEach((block) => {
          const values = this.workbench.blockFormInstanceMap.get(block.id).getFieldsValue();
          block.propItemList.forEach((item) => {
            item.defaultValue = values[item.propKey];
          });
        })
      })
    } else {
      this.workbench.designMode = true;
    }
  }

  public switchManualMode = () => {
    this.workbench.jsonMode = false;
    this.workbench.designMode = false;
    if (this.workbench.manualMode) {
      this.workbench.manualMode = false;
    } else {
      this.workbench.manualMode = true;
    }
  }

  public switchJSONMode = () => {
    this.workbench.manualMode = false;
    this.workbench.designMode = false;
    if (this.workbench.jsonMode) {
      this.workbench.jsonMode = false;
    } else {
      this.workbench.jsonMode = true;
    }
  }

  /**
   * 向堆栈中追加item
   * @param item 追加的PropItem
   */
  public pushPropItemStack = (item: PropItem) => {
    let removeList = [];

    // 从堆栈中查找同属一个分组的item
    for (let index = 0; index < this.propItemStack.length; index++) {
      const stackItem = this.propItemStack[index];
      if (stackItem.groupId === item.groupId) {
        const rlist = this.propItemStack.splice(index);
        removeList.push(...rlist);
        break;
      }
    }

    // 重置堆栈中item
    this.cancelHighlightStudioChain(removeList);

    const group = this.workbench.getPropGroup(item.groupId);
    group.highlight = true;

    if (item.blockId === group.templateBlockId) {
      group.templateBlock.highlight = true;
    } else {
      const block = group.propBlockList.find(b => b.id === item.blockId);
      block.highlight = true;
    }

    item.highlight = true;

    this.propItemStack.push(item);

    item.valueOfGroup.templateBlockDesignMode = false;
  }

  /**
   * 从堆栈中弹出配置项
   * @param propItem 从当前propItem开始之后所有item
   * @param clearSelf 是否弹出当前propItem
   */
  public popPropItemStack = (propItem: PropItem) => {
    const index = this.propItemStack.findIndex(item => item.id === propItem.id);
    if (index !== -1) {
      const isolateItemList = this.propItemStack.splice(index);
      this.cancelHighlightStudioChain(isolateItemList);
    }
  }

  /**
   * 取消多个item高亮
   * @param itemList 数组
   */
  private cancelHighlightStudioChain(itemList: PropItem[]) {
    itemList.forEach(item => {
      item.highlight = false;

      const group = this.workbench.getPropGroup(item.groupId);
      group.highlight = false;

      if (item.blockId === group.templateBlockId) {
        group.templateBlock.highlight = false;
      } else {
        const block = group.propBlockList.find(b => b.id === item.blockId);
        block.highlight = false;
      }
    })
  }

  public showPropBlockSettinngForCreate = (group: PropGroup) => {
    const nameSuffix = autoIncrementForName(group.propBlockList.map(b => b.name));

    this.currSettingPropBlock = {
      name: `配置块${nameSuffix}`,
      groupId: group.id,
      propItemList: [],
      order: 0
    } as PropBlock;
  }

  public showPropItemSettinngForCreate = (block: PropBlock) => {
    const nameSuffix = autoIncrementForName(block.propItemList.map(item => item.label));
    const propSuffix = autoIncrementForName(block.propItemList.map(item => item.propKey));

    this.currSettingPropItem = {
      id: 0,
      type: 'Input',
      label: `配置项${nameSuffix}`,
      propKey: `prop${propSuffix}`,
      blockId: block.id,
      groupId: block.groupId,
      span: 24,
      order: 0
    } as PropItem;
  }

  public createCodemeta(component: Component) {
    const codemetas = [] as CodeMeta[];
    for (let groupIndex = 0; groupIndex < this.workbench.rootGroupList.length; groupIndex++) {
      const group = this.workbench.rootGroupList[groupIndex]!;
      this.createCodemetaFromGroup(group, codemetas, '');
    }
    return codemetas;
  }

  private createCodemetaFromGroup(group: PropGroup, codemetas: CodeMeta[], contextKey = '') {
    const blocks = group.propBlockList;
    const groupPropKey = group.propKey || '';
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex]!;
      const blockPropKey = block.propKey || '';
      for (let itemIndex = 0; itemIndex < block.propItemList.length; itemIndex++) {
        const item = block.propItemList[itemIndex]!;
        const itemPropKey = item.propKey || '';
        const keyArr = [contextKey];

        if (group.relativeItemId) {
          keyArr.push(`[${blockIndex}]`);
        } else {
          keyArr.push(groupPropKey, blockPropKey);
        }

        if (!group.relativeItemId && block.rootPropKey) {
          keyArr.length = 0;
          keyArr.push(blockPropKey);
        }

        keyArr.push(itemPropKey);

        if (!group.relativeItemId && item.rootPropKey) {
          keyArr.length = 0;
          keyArr.push(itemPropKey);
        }

        const key = keyArr.filter(k => !!k).join('.');
        codemetas.push({
          id: uuid(),
          key,
          type: item.type as any,
          defaultValue: item.defaultValue
        });
        if (item.type === 'List') {
          this.createCodemetaFromGroup(item.valueOfGroup!, codemetas, key);
        }
      }
    }
  }
}
