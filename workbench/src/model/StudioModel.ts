import { autoIncrementForName, uuid } from "@util/utils";
import { serverPath } from "config";
import WorkbenchModel from "./WorkbenchModel";

export default class StudioModel {
  /**
   * 当前激活分组的ID
   */
  public activeGroupId?: number;
  /**
   * 当前激活分组是否是编辑状态
   */
  public activeGroupDesignMode = false;
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

  public toggleActiveGroupDesignMode = () => {
    this.activeGroupDesignMode = !this.activeGroupDesignMode;
  }

  public movePropBlock = (group: PropGroup, originIndex: number, up: boolean) => {
    const [moveBlock] = group.propBlockList.splice(originIndex, 1);
    fetch(`${serverPath}/move/position`, {
      body: JSON.stringify({
        originId: moveBlock!.id,
        targetId: up ? group.propBlockList[originIndex - 1]!.id : group.propBlockList[originIndex + 1]?.id,
        type: 'block'
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(r => r.json()).then(() => {

      if (up) {
        group.propBlockList.splice(originIndex - 1, 0, moveBlock!);
      } else {
        group.propBlockList.splice(originIndex + 1, 0, moveBlock!);
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
    })
  }

  public movePropItem = (block: PropBlock, originIndex: number, up: boolean) => {
    const origin = block.propItemList[originIndex]!;
    fetch(`${serverPath}/move/position`, {
      body: JSON.stringify({
        originId: origin.id,
        targetId: up ? block.propItemList[originIndex - 1]!.id : block.propItemList[originIndex + 1]?.id,
        type: 'item'
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(r => r.json()).then((result: { data: { originId: number, targetId: number, blockId: number }[] }) => {
      for (let index = 0; index < result.data.length; index++) {
        const { blockId } = result.data[index]!;
        const block = this.workbench.getPropBlock(blockId);
        const [moveItem] = block.propItemList.splice(originIndex, 1);
        if (up) {
          block.propItemList.splice(originIndex - 1, 0, moveItem!);
        } else {
          block.propItemList.splice(originIndex + 1, 0, moveItem!);
        }
      }
    });
  }

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
      fetch(`${serverPath}/group/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newGroup)
        }
      ).then(r => r.json()).then((result: { data: PropGroup }) => {
        const groupDB = result.data;
        this.workbench.rootGroupList.push(groupDB);
        // this.component.version.groupList.push(result.data);
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
    const newBlock = Object.assign(this.currSettingPropBlock!, block);
    const group = this.workbench.getPropGroup(newBlock.groupId);

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
        // this.component.version.blockList.push(result.data);
      })

    }
    this.currSettingPropBlock = undefined;
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
    const newItem = Object.assign(this.currSettingPropItem!, item);

    if (!['select', 'radio', 'checkbox'].includes(newItem.type)) {
      newItem.optionList = undefined;
    }

    if (newItem.id) {
      fetch(`${serverPath}/item/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      }).then(r => r.json()).then((result: { data: PropItem[] }) => {
        for (let index = 0; index < result.data.length; index++) {
          const propItem = result.data[index]!;
          const block = this.workbench.getPropBlock(propItem.blockId);
          let itemIndex = block.propItemList.findIndex(item => item.id === propItem.id);
          block.propItemList.splice(itemIndex, 1, propItem);
        }
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
          const data = result.data[index]!;
          this.addPropItemFn(data);
        }
      })
    }

    this.currSettingPropItem = undefined;

    setTimeout(() => {
      this.workbench.productStudioData();
    }, 100)
  }

  private addPropItemFn = (data: { newItem: PropItem, valueOfGroup: PropGroup, templateBlock: PropBlock }) => {
    const block = this.workbench.getPropBlock(data.newItem.blockId);
    block.propItemList.push(data.newItem);
    if (data.newItem.type === 'List') {
      const valueOfGroup = data.valueOfGroup;
      const templateBlock = data.templateBlock;

      valueOfGroup.propBlockList = valueOfGroup.propBlockList.filter(b => b.id !== templateBlock.id);
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
    const activeItem = this.workbench.rootGroupList.find(g => g.id === id);
    if (activeItem) {
      this.activeGroupId = id;
      this.activeGroupDesignMode = false;
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
    if (this.propItemStack.length) {
      // 重置item所在分组高亮
      const resetItem = this.propItemStack[this.propItemStack.length - 1];
      this.cancelHighlightStudioChain([resetItem]);
    }

    const group = this.workbench.getPropGroup(item.groupId);
    group.highlight = true;
    const block = group.propBlockList.find(b => b.id === item.blockId);
    block.highlight = true;
    item.highlight = true;

    this.propItemStack.push(item);
  }

  /**
   * 从堆栈中弹出配置项
   * @param propItem 从当前propItem开始之后所有item
   * @param clearSelf 是否弹出当前propItem
   */
  public popPropItemStack = (propItem: PropItem, clearSelf: boolean) => {
    const index = this.propItemStack.findIndex(item => item.id === propItem.id);
    if (index !== -1) {
      const isolateItemList = this.propItemStack.splice(clearSelf ? index : index + 1);
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
      const block = group.propBlockList.find(b => b.id === item.blockId);
      block.highlight = false;
    })
  }

  public showPropBlockSettinngForCreate = (group: PropGroup) => {
    const nameSuffix = autoIncrementForName(group.propBlockList.map(b => b.name));

    this.currSettingPropBlock = {
      id: 0,
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
