import { autoIncrementForName, uuid } from "@util/utils";
import { FormInstance } from "antd";
import { serverPath } from "config";

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

  /**
   * 当前组件配置对象
   */
  public component = {} as Component;
  /**
   * 设置配置项模式
   */
  public editMode = false;
  /**
   * 手动编码配置模式
   */
  public manualMode = false;
  /**
   * json模式
   */
  public jsonMode = false;
  /**
   * 配置块所属表单实例
   */
  public blockFormInstanceMap = new Map<number, FormInstance>();
  /**
   * 配置项变动通知iframe更新
   */
  public notifyIframe?: Function;

  public handUpPropItemStack: PropItem[] = [];

  public innerTempPropGroupMap = new Map<number, PropGroup>();

  public currEnv: 'dev' | 'qa' | 'pl' | 'online' = 'dev';

  public init(component: Component, editMode = false) {
    this.component = component;
    this.buildPropGroups();
    this.activeGroupId = this.component.version.rootGroupList![0]?.id;
    this.editMode = editMode;

    if (this.component.release!.id === this.component.project.devRelease.id) {
      this.currEnv = 'dev';
    } else if (this.component.release!.id === this.component.project.qaRelease?.id) {
      this.currEnv = 'qa';
    } else if (this.component.release!.id === this.component.project.plRelease?.id) {
      this.currEnv = 'pl';
    } else if (this.component.release!.id === this.component.project.onlineRelease.id) {
      this.currEnv = 'online';
    }
  }

  // todo
  public productStudioData = () => {
    const props: any[] = [];
    this.component.version.rootGroupList!.forEach((group) => {
      group.propBlockList.forEach((block) => {
        const values = this.blockFormInstanceMap.get(block.id)?.getFieldsValue();
        block.propItemList.forEach((item) => {
          props.push({
            key: item.propKey,
            defaultValue: values ? values[item.propKey] : item.defaultValue
          })
        })
      })
    })
    this.notifyIframe!(JSON.stringify(props));
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
      const groups = this.component.version.rootGroupList!;

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
    const [moveItem] = block.propItemList.splice(originIndex, 1);
    fetch(`${serverPath}/move/position`, {
      body: JSON.stringify({
        originId: moveItem!.id,
        targetId: up ? block.propItemList[originIndex - 1]!.id : block.propItemList[originIndex + 1]?.id,
        type: 'item'
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(r => r.json()).then(() => {
      if (up) {
        block.propItemList.splice(originIndex - 1, 0, moveItem!);
      } else {
        block.propItemList.splice(originIndex + 1, 0, moveItem!);
      }
    });
  }

  public updateOrAddPropGroup = (group: PropGroup) => {
    const newGroup = Object.assign(this.currSettingPropGroup, group);

    if (newGroup.id) {
      fetch(`${serverPath}/group/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroup)
      }).then(r => r.json()).then(() => {
        let groupIndex = this.component.version.rootGroupList!.findIndex(g => g.id === newGroup.id);
        this.component.version.rootGroupList!.splice(groupIndex, 1, newGroup);
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
      ).then(r => r.json()).then(({ data: groupData }) => {

        this.component.version.rootGroupList!.push(JSON.parse(JSON.stringify(groupData)));

        this.activeGroupId = groupData.id;
      })
    }

    this.currSettingPropGroup = undefined;
  }

  public updateOrAddPropBlock = (block: PropBlock) => {
    const newBlock = Object.assign(this.currSettingPropBlock, block);
    const group = this.getPropGroup(newBlock.groupId)!;

    if (newBlock.id) {
      fetch(`${serverPath}/block/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBlock)
      }).then(r => r.json()).then(() => {
        let blockIndex = group.propBlockList.findIndex(b => b.id === newBlock.id);
        group.propBlockList.splice(blockIndex, 1, JSON.parse(JSON.stringify(newBlock)));
      });
    } else {
      fetch(`${serverPath}/block/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBlock)
      }).then(r => r.json()).then(({ data: blockData }) => {
        group?.propBlockList.push(blockData);
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
    }).then(r => r.json()).then(({ data: blockData }) => {
      const group = this.getPropGroup(groupId)!;
      group.propBlockList.push(blockData);
    })
  }

  public updateOrAddPropItem = (item: PropItem) => {
    const newItem = Object.assign(this.currSettingPropItem, item);

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
      }).then(r => r.json()).then(() => {
        const block = this.getPropBlock(newItem.blockId)!;
        let itemIndex = block.propItemList.findIndex(item => item.id === newItem.id);
        block.propItemList.splice(itemIndex, 1, JSON.parse(JSON.stringify(newItem)));
      });
    } else {
      const block = this.getPropBlock(newItem.blockId)!;
      fetch(`${serverPath}/item/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      }).then(r => r.json()).then((result: { data: { newItem: PropItem, valueOfGroup: PropGroup, templateBlock: PropBlock } }) => {
        const resultItem = result.data.newItem;

        block.propItemList.push(resultItem);
        if (newItem.type === 'array-object') {
          const valueOfGroup = result.data.valueOfGroup;
          const templateBlock = result.data.templateBlock;

          valueOfGroup.propBlockList = valueOfGroup.propBlockList.filter(b => b.id !== templateBlock.id);
          valueOfGroup.templateBlock = templateBlock;
          resultItem.templateBlock = templateBlock;
          resultItem.valueOfGroup = valueOfGroup;
        }
      })
    }

    this.currSettingPropItem = undefined;

    setTimeout(() => {
      this.productStudioData();
    }, 100)
  }

  public delGroup = (groupId: number) => {
    fetch(`${serverPath}/group/remove/${groupId}`).then(() => {
      const index = this.component.version.rootGroupList!.findIndex(g => g.id === groupId);

      this.component.version.rootGroupList!.splice(index, 1);

      if (this.activeGroupId === groupId) {
        this.activeGroupId = this.component.version.rootGroupList![0]?.id;
      }
    })
  }

  public delBlock = (blockId: number, group: PropGroup) => {
    fetch(`${serverPath}/block/remove/${blockId}`).then(() => {
      let blockIndex = group.propBlockList.findIndex(b => b.id === blockId);
      group.propBlockList.splice(blockIndex, 1);
    })
  }

  public delItem = (itemId: number, block: PropBlock) => {
    fetch(`${serverPath}/item/remove/${itemId}`).then(() => {
      let itemIndex = block.propItemList.findIndex(item => item.id === itemId);
      block.propItemList.splice(itemIndex, 1);
    })
  }

  public switchActiveGroup = (id: number) => {
    const activeItem = this.component.version.rootGroupList!.find(g => g.id === id);
    if (activeItem) {
      this.activeGroupId = id;
    }
  }

  public switchEditMode = () => {
    this.jsonMode = false;
    this.manualMode = false;
    if (this.editMode) {
      this.editMode = false;
      this.component.version.rootGroupList!.forEach((group) => {
        group.propBlockList.forEach((block) => {
          const values = this.blockFormInstanceMap.get(block.id)?.getFieldsValue();
          block.propItemList.forEach((item) => {
            item.defaultValue = values[item.propKey];
          });
        })
      })
    } else {
      this.editMode = true;
    }
  }

  public switchManualMode = () => {
    this.jsonMode = false;
    this.editMode = false;
    if (this.manualMode) {
      this.manualMode = false;
    } else {
      this.manualMode = true;
    }
  }

  public switchJSONMode = () => {
    this.manualMode = false;
    this.editMode = false;
    if (this.jsonMode) {
      this.jsonMode = false;
    } else {
      this.jsonMode = true;
    }
  }

  public pushHandUpPropItem = (item: PropItem) => {
    this.handUpPropItemStack?.push(item);
  }

  public popHandUpPropItem = (group: PropGroup, templateBlockOfArrayObject: PropBlock) => {
    const item = this.handUpPropItemStack.pop();
    if (item) {
      item.valueOfGroup = JSON.parse(JSON.stringify(group));
      item.templateBlock = JSON.parse(JSON.stringify(templateBlockOfArrayObject));
    }
  }

  public getPropGroup = (groupId: number) => {
    let group = this.component.version.rootGroupList!.find((group) => {
      return group.id === groupId;
    })

    return group || this.innerTempPropGroupMap.get(groupId);
  }

  public getPropBlock = (blockId: number) => {
    for (let groupIndex = 0; groupIndex < this.component.version.rootGroupList!.length; groupIndex++) {
      const group = this.component.version.rootGroupList![groupIndex];
      for (let blockIndex = 0; blockIndex < group!.propBlockList.length; blockIndex++) {
        const block = group?.propBlockList[blockIndex];
        if (block?.id === blockId) {
          return block;
        }
      }
    }

    const tempGroups = [...this.innerTempPropGroupMap.values()];
    for (let groupIndex = 0; groupIndex < tempGroups.length; groupIndex++) {
      const group = tempGroups[groupIndex];

      if (group?.templateBlock!.id === blockId) {
        return group?.templateBlock;
      }

      for (let blockIndex = 0; blockIndex < group!.propBlockList.length; blockIndex++) {
        const block = group!.propBlockList[blockIndex];
        if (block?.id === blockId) {
          return block;
        }
      }
    }

    return undefined;
  }

  public showPropBlockSettinngForCreate = (group: PropGroup) => {
    const nameSuffix = autoIncrementForName(group.propBlockList.map(b => b.name));

    this.currSettingPropBlock = {
      id: 0,
      name: `配置块${nameSuffix}`,
      groupId: group.id,
      propItemList: [],
      order: 0
    };
  }

  public showPropItemSettinngForCreate = (block: PropBlock) => {
    const nameSuffix = autoIncrementForName(block.propItemList.map(item => item.label));
    const propSuffix = autoIncrementForName(block.propItemList.map(item => item.propKey));

    this.currSettingPropItem = {
      id: 0,
      type: 'input',
      label: `配置项${nameSuffix}`,
      propKey: `prop${propSuffix}`,
      blockId: block.id,
      groupId: block.groupId,
      span: 24,
      order: 0
    }
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
          type: item.type,
          defaultValue: item.defaultValue
        });
        if (item.type === 'array-object') {
          this.createCodemetaFromGroup(item.valueOfGroup!, codemetas, key);
        }
      }
    }
  }

  private buildPropGroups() {
    this.component.version.rootGroupList = [];
    const rootGroupIds = this.component.version.groupList
      .filter(g => g.root)
      .sort((a, b) => a.order - b.order)
      .map(g => g.id);

    for (let i = 0; i < rootGroupIds.length; i++) {
      const groupId = rootGroupIds[i]!;
      const group = this.buildPropGroup(groupId);
      this.component.version.rootGroupList.push(group);
    }
  }

  private buildPropGroup(groupId: number) {
    const group = this.component.version.groupList.find(g => g.id === groupId);
    if (!group) {
      throw new Error(`can not find group[${groupId}]`);
    }

    const blocks = this.component.version.blockList
      .filter(b => b.groupId === groupId)
      .sort((a, b) => a.order - b.order)

    group.propBlockList = blocks;
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex]!;
      const items = this.component.version.itemList
        .filter(i => i.groupId === groupId && i.blockId === block.id)
        .sort((a, b) => a.order - b.order)

      block.propItemList = items;

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const item = items[itemIndex]!;
        if (item.type === 'array-object') {
          const relativeGroup = this.buildPropGroup(item.valueOfGroupId!);
          const templateBlock = relativeGroup.propBlockList.find(b => b.id === item.templateBlockId);
          relativeGroup.propBlockList = relativeGroup.propBlockList.filter(b => b.id !== item.templateBlockId);
          relativeGroup.templateBlock = templateBlock;

          item.valueOfGroup = relativeGroup;
          item.templateBlock = templateBlock;
        }
      }
    }

    return group;
  }

}
