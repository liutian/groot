import { autoIncrementForName, uuid } from "@util/utils";
import { serverPath } from "config";
import WorkbenchModel from "./WorkbenchModel";

export default class StudioModel {
  /**
   * tab激活的分组
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

  public currEnv: 'dev' | 'qa' | 'pl' | 'online' = 'dev';

  public activeGroupEditMode = false;

  public workbench: WorkbenchModel;

  public init(workbench: WorkbenchModel) {
    this.workbench = workbench;
    this.activeGroupId = this.workbench.component.version.rootGroupList[0].id;

    if (!workbench.stageMode) {
      const releaseId = this.workbench.component.release.id;
      const project = this.workbench.component.project;
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

  public toggleActiveGroupEditMode = () => {
    this.activeGroupEditMode = !this.activeGroupEditMode;
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
      const groups = this.workbench.component.version.rootGroupList;

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
    const newGroup = Object.assign(this.currSettingPropGroup!, group);
    newGroup.componentId = this.workbench.component.id;
    newGroup.componentVersionId = this.workbench.component.version.id;

    if (newGroup.id) {
      fetch(`${serverPath}/group/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroup)
      }).then(r => r.json()).then(() => {
        let groupIndex = this.workbench.component.version.rootGroupList!.findIndex(g => g.id === newGroup.id);
        this.workbench.component.version.rootGroupList!.splice(groupIndex, 1, newGroup);
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
        this.workbench.component.version.rootGroupList!.push(groupDB);
        // this.component.version.groupList.push(result.data);
        this.activeGroupId = groupDB.id;

        if (newGroup.struct === 'List') {
          groupDB.templateBlock = groupDB.propBlockList.find(b => b.id === groupDB.templateBlockId);
          groupDB.propBlockList.length = 0;
        }
      })
    }

    this.currSettingPropGroup = undefined;
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
      const index = this.workbench.component.version.rootGroupList!.findIndex(g => g.id === groupId);

      this.workbench.component.version.rootGroupList!.splice(index, 1);

      if (this.activeGroupId === groupId) {
        this.activeGroupId = this.workbench.component.version.rootGroupList![0]?.id;
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
    const activeItem = this.workbench.component.version.rootGroupList!.find(g => g.id === id);
    if (activeItem) {
      this.activeGroupId = id;
      this.activeGroupEditMode = false;
    }
  }

  public switchEditMode = () => {
    this.workbench.jsonMode = false;
    this.workbench.manualMode = false;
    if (this.workbench.stageMode) {
      this.workbench.stageMode = false;
      this.workbench.component.version.rootGroupList!.forEach((group) => {
        group.propBlockList.forEach((block) => {
          const values = this.workbench.blockFormInstanceMap.get(block.id).getFieldsValue();
          block.propItemList.forEach((item) => {
            item.defaultValue = values[item.propKey];
          });
        })
      })
    } else {
      this.workbench.stageMode = true;
    }
  }

  public switchManualMode = () => {
    this.workbench.jsonMode = false;
    this.workbench.stageMode = false;
    if (this.workbench.manualMode) {
      this.workbench.manualMode = false;
    } else {
      this.workbench.manualMode = true;
    }
  }

  public switchJSONMode = () => {
    this.workbench.manualMode = false;
    this.workbench.stageMode = false;
    if (this.workbench.jsonMode) {
      this.workbench.jsonMode = false;
    } else {
      this.workbench.jsonMode = true;
    }
  }

  public pushHandUpPropItem = (item: PropItem) => {
    for (let index = 0; index < this.propItemStack.length; index++) {
      const { id: itemId, groupId } = this.propItemStack[index]!;

      if (item.id === itemId) {
        this.cancelHighlightCascaderStudio(this.propItemStack.splice(index + 1));
        return;
      }

      if (item.groupId === groupId) {
        this.cancelHighlightCascaderStudio(this.propItemStack.splice(index));
        item.highlight = true;
        this.workbench.getPropBlock(item.blockId).highlight = true;
        this.workbench.getPropGroup(item.groupId).highlight = true;
        this.propItemStack.push(item);
        return;
      }
    }

    item.highlight = true;
    this.workbench.getPropBlock(item.blockId).highlight = true;
    this.workbench.getPropGroup(item.groupId).highlight = true;
    this.propItemStack.push(item);
  }

  public popHandUpPropItem = (propItem: PropItem) => {
    const index = this.propItemStack.findIndex(item => item.id === propItem.id);
    this.cancelHighlightCascaderStudio(this.propItemStack.splice(index));
  }

  private cancelHighlightCascaderStudio(itemList: PropItem[]) {
    itemList.forEach(item => {
      item.highlight = false;
      this.workbench.getPropBlock(item.blockId).highlight = false;
      this.workbench.getPropGroup(item.groupId).highlight = false;
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
    for (let groupIndex = 0; groupIndex < component.version.rootGroupList!.length; groupIndex++) {
      const group = component.version.rootGroupList![groupIndex]!;
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
