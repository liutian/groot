import { PropItemType } from "@grootio/common";
import { autoIncrementForName, parseOptions, stringifyOptions, uuid } from "@util/utils";
import { serverPath } from "config";
import PropHandleModel from "./PropHandleModel";
import WorkbenchModel from "./WorkbenchModel";

export default class PropPersistModel {
  static modelName = 'propPersist';
  /**
   * 正在配置的分组
   */
  public currSettingPropGroup?: PropGroup;
  /**
   * 正在配置的块
   */
  public currSettingPropBlock?: PropBlock;
  /**
   * 正在配置的项
   */
  public currSettingPropItem?: PropItem;

  public settingModalLoading = false;

  private workbench: WorkbenchModel;
  private propHandle: PropHandleModel

  public inject(workbench: WorkbenchModel, propHandle: PropHandleModel) {
    this.workbench = workbench;
    this.propHandle = propHandle;
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
      const groups = this.propHandle.rootGroupList;

      const drag = groups.find(g => g.id === +dragId)!;
      const hoverIndex = hoverId === '__add' ? groups.length : groups.findIndex(g => g.id === +hoverId);
      const dragIndex = groups.findIndex(g => g.id === +dragId);
      const currentIndex = groups.findIndex(g => g.id === this.propHandle.activeGroupId);

      groups.splice(hoverIndex, 0, drag);

      if (hoverIndex < dragIndex) {
        groups.splice(dragIndex + 1, 1);
        if (currentIndex >= hoverIndex && currentIndex < dragIndex) {
          this.propHandle.activeGroupId = groups[currentIndex + 1].id;
        } else if (currentIndex === dragIndex) {
          this.propHandle.activeGroupId = +hoverId;
        }
      } else {
        if (currentIndex === dragIndex && currentIndex < hoverIndex) {
          this.propHandle.activeGroupId = groups[currentIndex - 1]?.id;
        } else if (currentIndex === dragIndex) {
          this.propHandle.activeGroupId = groups[hoverIndex - 1]?.id;
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
        const block = this.propHandle.getPropBlock(blockId);
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
        let groupIndex = this.propHandle.rootGroupList.findIndex(g => g.id === newGroup.id);
        this.propHandle.rootGroupList.splice(groupIndex, 1, newGroup);
        this.settingModalLoading = false;
        this.currSettingPropGroup = undefined;
        this.workbench.iframeManager.refreshComponent();
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
        this.propHandle.rootGroupList.push(groupDB);
        this.propHandle.activeGroupId = groupDB.id;

        if (newGroup.struct === 'List') {
          groupDB.templateBlock = groupDB.propBlockList.find(b => b.id === groupDB.templateBlockId);
          groupDB.propBlockList.length = 0;
        }

        this.settingModalLoading = false;
        this.currSettingPropGroup = undefined;
        this.workbench.iframeManager.refreshComponent();
      })
    }
  }

  public updateOrAddPropBlock = (block: PropBlock) => {
    const newBlock = Object.assign(this.currSettingPropBlock, block);
    const group = this.propHandle.getPropGroup(newBlock.groupId);

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
        this.workbench.iframeManager.refreshComponent();
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
        this.workbench.iframeManager.refreshComponent();
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
      const group = this.propHandle.getPropGroup(groupId);
      this.propHandle.buildPropGroup(group, {
        groupList: result.data.groupList,
        blockList: result.data.blockList,
        itemList: result.data.itemList
      });
      this.workbench.iframeManager.refreshComponent();
    })
  }

  public updateOrAddPropItem = (item: PropItem) => {
    const newItem = Object.assign(this.currSettingPropItem, item);

    if (!['Select', 'Radio', 'Checkbox', 'Button_Group'].includes(newItem.type)) {
      newItem.optionList = undefined;
    } else {
      stringifyOptions(newItem);
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
          parseOptions(propItem);
          const block = this.propHandle.getPropBlock(propItem.blockId);
          let itemIndex = block.propItemList.findIndex(item => item.id === propItem.id);
          block.propItemList.splice(itemIndex, 1, propItem);
        }

        this.settingModalLoading = false;
        this.currSettingPropItem = undefined;
        this.workbench.iframeManager.refreshComponent();
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
        this.workbench.iframeManager.refreshComponent();
      })
    }
  }

  private addPropItemFn = (data: { newItem: PropItem, valueOfGroup: PropGroup, templateBlock: PropBlock }) => {
    const block = this.propHandle.getPropBlock(data.newItem.blockId);
    block.propItemList.push(data.newItem);
    if (data.newItem.type === PropItemType.LIST) {
      const valueOfGroup = data.valueOfGroup;
      const templateBlock = data.templateBlock;

      valueOfGroup.propBlockList.length = 0;
      valueOfGroup.templateBlock = templateBlock;
      data.newItem.templateBlock = templateBlock;
      data.newItem.valueOfGroup = valueOfGroup;
    } else if (data.newItem.type === PropItemType.ITEM) {
      const valueOfGroup = data.valueOfGroup;
      data.newItem.directBlock = valueOfGroup.propBlockList[0];
      data.newItem.valueOfGroup = valueOfGroup;
    } else if (data.newItem.type === PropItemType.HIERARCHY) {
      const valueOfGroup = data.valueOfGroup;
      data.newItem.valueOfGroup = valueOfGroup;
      valueOfGroup.expandBlockIdList = [];
    }
    parseOptions(data.newItem);
  }

  public delGroup = (groupId: number) => {
    fetch(`${serverPath}/group/remove/${groupId}`).then(() => {
      const index = this.propHandle.rootGroupList.findIndex(g => g.id === groupId);

      this.propHandle.rootGroupList.splice(index, 1);

      if (this.propHandle.activeGroupId === groupId) {
        this.propHandle.activeGroupId = this.propHandle.rootGroupList[0]?.id;
      }
      this.workbench.iframeManager.refreshComponent();
    })
  }

  public delBlock = (blockId: number, group: PropGroup) => {
    fetch(`${serverPath}/block/remove/${blockId}`).then(() => {
      let blockIndex = group.propBlockList.findIndex(b => b.id === blockId);
      group.propBlockList.splice(blockIndex, 1);
      this.workbench.iframeManager.refreshComponent();
    })
  }

  public delItem = (itemId: number) => {
    fetch(`${serverPath}/item/remove/${itemId}`).then(r => r.json()).then((result: { data: PropItem[] }) => {
      for (let index = 0; index < result.data.length; index++) {
        const itemData = result.data[index]!;
        const block = this.propHandle.getPropBlock(itemData.blockId);
        let itemIndex = block.propItemList.findIndex(item => item.id === itemData.id);
        block.propItemList.splice(itemIndex, 1);
      }
      this.workbench.iframeManager.refreshComponent();
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
      type: 'Text',
      label: `配置项${nameSuffix}`,
      propKey: `prop${propSuffix}`,
      blockId: block.id,
      groupId: block.groupId,
      span: 24,
      order: 0
    } as PropItem;
  }

  public autoSavePropItemDefaultValue(block: PropBlock, formObj: Object) {
    block.propItemList.forEach((item) => {
      if (formObj[item.propKey] !== undefined) {
        item.defaultValue = formObj[item.propKey];
      }
    })
  }
}
