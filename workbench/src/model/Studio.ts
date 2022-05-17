import { autoIncrementForName, uuid } from "@util/utils";
import { FormInstance } from "antd";
import { serverPath } from "config";

export default class Studio {
  /**
   * tab激活的分组
   */
  public activeGroupId?: number;
  /**
   * 当前配置组
   */
  public currSettingStudioGroup?: CodeMetaStudioGroup;
  /**
   * 当前配置块
   */
  public currSettingStudioBlock?: CodeMetaStudioBlock;
  /**
   * 当前配置项
   */
  public currSettingStudioItem?: CodeMetaStudioItem;

  /**
   * 当前组件配置对象
   */
  public componentStudio = {} as ComponentStudio;
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

  public handUpStudioItemStack: CodeMetaStudioItem[] = [];

  public innerTempStudioGroupMap = new Map<number, CodeMetaStudioGroup>();

  public init(codeMetaStudio: ComponentStudio) {
    this.componentStudio = codeMetaStudio;
    this.buildPropGroups(codeMetaStudio);
    this.activeGroupId = codeMetaStudio.rootGroups[0]?.id;
    this.settingMode = true;
  }

  // todo
  public productStudioData = () => {
    const props: any[] = [];
    this.componentStudio.rootGroups.forEach((group) => {
      group.propBlocks.forEach((block) => {
        const values = this.blockFormInstanceMap.get(block.id)?.getFieldsValue();
        block.propItems.forEach((item) => {
          props.push({
            key: item.propKey,
            defaultValue: values ? values[item.propKey] : item.defaultValue
          })
        })
      })
    })
    this.notifyIframe!(JSON.stringify(props));
  }

  public moveStudioBlock = (group: CodeMetaStudioGroup, originIndex: number, up: boolean) => {
    const [moveBlock] = group.propBlocks.splice(originIndex, 1);
    fetch(`${serverPath}/move/position`, {
      body: JSON.stringify({
        originId: moveBlock!.id,
        targetId: up ? group.propBlocks[originIndex - 1]!.id : group.propBlocks[originIndex + 1]?.id,
        type: 'block'
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(r => r.json()).then(() => {

      if (up) {
        group.propBlocks.splice(originIndex - 1, 0, moveBlock!);
      } else {
        group.propBlocks.splice(originIndex + 1, 0, moveBlock!);
      }
    });
  }

  public moveStudioGroup = (dragId: string, hoverId: string) => {
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
      const groups = this.componentStudio.rootGroups;

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

  public moveStudioItem = (block: CodeMetaStudioBlock, originIndex: number, up: boolean) => {
    const [moveItem] = block.propItems.splice(originIndex, 1);
    fetch(`${serverPath}/move/position`, {
      body: JSON.stringify({
        originId: moveItem!.id,
        targetId: up ? block.propItems[originIndex - 1]!.id : block.propItems[originIndex + 1]?.id,
        type: 'item'
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(r => r.json()).then(() => {
      if (up) {
        block.propItems.splice(originIndex - 1, 0, moveItem!);
      } else {
        block.propItems.splice(originIndex + 1, 0, moveItem!);
      }
    });
  }

  public updateOrAddStudioGroup = (group: CodeMetaStudioGroup) => {
    const newGroup = Object.assign(this.currSettingStudioGroup, group);

    if (newGroup.id) {
      fetch(`${serverPath}/group/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroup)
      }).then(r => r.json()).then(() => {
        let groupIndex = this.componentStudio.rootGroups.findIndex(g => g.id === newGroup.id);
        this.componentStudio.rootGroups.splice(groupIndex, 1, newGroup);
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

        this.componentStudio.rootGroups.push(JSON.parse(JSON.stringify(groupData)));

        this.activeGroupId = groupData.id;
      })
    }

    this.currSettingStudioGroup = undefined;
  }

  public updateOrAddStudioBlock = (block: CodeMetaStudioBlock) => {
    const newBlock = Object.assign(this.currSettingStudioBlock, block);
    const group = this.getStudioGroup(newBlock.groupId)!;

    if (newBlock.id) {
      fetch(`${serverPath}/block/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBlock)
      }).then(r => r.json()).then(() => {
        let blockIndex = group.propBlocks.findIndex(b => b.id === newBlock.id);
        group.propBlocks.splice(blockIndex, 1, JSON.parse(JSON.stringify(newBlock)));
      });
    } else {
      fetch(`${serverPath}/block/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBlock)
      }).then(r => r.json()).then(({ data: blockData }) => {
        group?.propBlocks.push(blockData);
      })

    }
    this.currSettingStudioBlock = undefined;
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
      const group = this.getStudioGroup(groupId)!;
      group.propBlocks.push(blockData);
    })
  }

  public updateOrAddStudioItem = (item: CodeMetaStudioItem) => {
    const newItem = Object.assign(this.currSettingStudioItem, item);

    if (!['select', 'radio', 'checkbox'].includes(newItem.type)) {
      newItem.options = undefined;
    }


    if (newItem.id) {
      fetch(`${serverPath}/item/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      }).then(r => r.json()).then(() => {
        const block = this.getStudioBlock(newItem.blockId)!;
        let itemIndex = block.propItems.findIndex(item => item.id === newItem.id);
        block.propItems.splice(itemIndex, 1, JSON.parse(JSON.stringify(newItem)));
      });
    } else {
      const block = this.getStudioBlock(newItem.blockId)!;
      fetch(`${serverPath}/item/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      }).then(r => r.json()).then((result: { data: { newItem: CodeMetaStudioItem, valueOfGroup: CodeMetaStudioGroup, templateBlock: CodeMetaStudioBlock } }) => {
        const resultItem = result.data.newItem;

        block.propItems.push(resultItem);
        if (newItem.type === 'array-object') {
          const valueOfGroup = result.data.valueOfGroup;
          const templateBlock = result.data.templateBlock;

          valueOfGroup.propBlocks = valueOfGroup.propBlocks.filter(b => b.id !== templateBlock.id);
          valueOfGroup.templateBlock = templateBlock;
          resultItem.templateBlock = templateBlock;
          resultItem.valueOfGroup = valueOfGroup;
        }
      })
    }

    this.currSettingStudioItem = undefined;

    setTimeout(() => {
      this.productStudioData();
    }, 100)
  }

  public delGroup = (groupId: number) => {
    fetch(`${serverPath}/group/remove/${groupId}`).then(() => {
      const index = this.componentStudio.rootGroups.findIndex(g => g.id === groupId);

      this.componentStudio.rootGroups.splice(index, 1);

      if (this.activeGroupId === groupId) {
        this.activeGroupId = this.componentStudio.rootGroups[0]?.id;
      }
    })
  }

  public delBlock = (blockId: number, group: CodeMetaStudioGroup) => {
    fetch(`${serverPath}/block/remove/${blockId}`).then(() => {
      let blockIndex = group.propBlocks.findIndex(b => b.id === blockId);
      group.propBlocks.splice(blockIndex, 1);
    })
  }

  public delItem = (itemId: number, block: CodeMetaStudioBlock) => {
    fetch(`${serverPath}/item/remove/${itemId}`).then(() => {
      let itemIndex = block.propItems.findIndex(item => item.id === itemId);
      block.propItems.splice(itemIndex, 1);
    })
  }

  public switchActiveGroup = (id: number) => {
    const activeItem = this.componentStudio.rootGroups.find(g => g.id === id);
    if (activeItem) {
      this.activeGroupId = id;
    }
  }

  public switchSettingMode = () => {
    if (this.settingMode) {
      this.settingMode = false;
      this.componentStudio.rootGroups.forEach((group) => {
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

  public pushHandUpStudioItem = (item: CodeMetaStudioItem) => {
    this.handUpStudioItemStack?.push(item);
  }

  public popHandUpStudioItem = (group: CodeMetaStudioGroup, templateBlockOfArrayObject: CodeMetaStudioBlock) => {
    const item = this.handUpStudioItemStack.pop();
    if (item) {
      item.valueOfGroup = JSON.parse(JSON.stringify(group));
      item.templateBlock = JSON.parse(JSON.stringify(templateBlockOfArrayObject));
    }
  }

  public getStudioGroup = (groupId: number) => {
    let group = this.componentStudio.rootGroups.find((group) => {
      return group.id === groupId;
    })

    return group || this.innerTempStudioGroupMap.get(groupId);
  }

  public getStudioBlock = (blockId: number) => {
    for (let groupIndex = 0; groupIndex < this.componentStudio.rootGroups.length; groupIndex++) {
      const group = this.componentStudio.rootGroups[groupIndex];
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

      if (group?.templateBlock!.id === blockId) {
        return group?.templateBlock;
      }

      for (let blockIndex = 0; blockIndex < group!.propBlocks.length; blockIndex++) {
        const block = group?.propBlocks[blockIndex];
        if (block?.id === blockId) {
          return block;
        }
      }
    }

    return undefined;
  }

  public showStudioBlockSettinngForCreate = (group: CodeMetaStudioGroup) => {
    const nameSuffix = autoIncrementForName(group.propBlocks.map(b => b.name));

    this.currSettingStudioBlock = {
      id: 0,
      name: `配置块${nameSuffix}`,
      groupId: group.id,
      propItems: [],
      order: 0
    };
  }

  public showStudioItemSettinngForCreate = (block: CodeMetaStudioBlock) => {
    const nameSuffix = autoIncrementForName(block.propItems.map(item => item.label));
    const propSuffix = autoIncrementForName(block.propItems.map(item => item.propKey));

    this.currSettingStudioItem = {
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

  public createCodemeta(componentStudio: ComponentStudio) {
    const codemetas = [] as CodeMeta[];
    for (let groupIndex = 0; groupIndex < componentStudio.rootGroups.length; groupIndex++) {
      const group = componentStudio.rootGroups[groupIndex]!;
      this.createCodemetaFromGroup(group, codemetas, '');
    }
    return codemetas;
  }

  private createCodemetaFromGroup(group: CodeMetaStudioGroup, codemetas: CodeMeta[], contextKey = '') {
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
          id: uuid(),
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

  private buildPropGroups(componentStudio: ComponentStudio) {
    componentStudio.rootGroups = [];
    const rootGroupIds = componentStudio.allGroups
      .filter(g => g.isRoot)
      .sort((a, b) => a.order - b.order)
      .map(g => g.id);

    for (let i = 0; i < rootGroupIds.length; i++) {
      const groupId = rootGroupIds[i]!;
      const group = this.buildStudioGroup(groupId);
      componentStudio.rootGroups.push(group);
    }
  }

  private buildStudioGroup(groupId: number) {
    const group = this.componentStudio.allGroups.find(g => g.id === groupId);
    if (!group) {
      throw new Error(`can not find group[${groupId}]`);
    }

    const blocks = this.componentStudio.allBlocks
      .filter(b => b.groupId === groupId)
      .sort((a, b) => a.order - b.order)

    group.propBlocks = blocks;
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex]!;
      const items = this.componentStudio.allItems
        .filter(i => i.groupId === groupId && i.blockId === block.id)
        .sort((a, b) => a.order - b.order)

      block.propItems = items;

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const item = items[itemIndex]!;
        if (item.type === 'array-object') {
          const relativeGroup = this.buildStudioGroup(item.valueOfGroupId!);
          const templateBlock = relativeGroup.propBlocks.find(b => b.id === item.templateBlockId);
          relativeGroup.propBlocks = relativeGroup.propBlocks.filter(b => b.id !== item.templateBlockId);
          relativeGroup.templateBlock = templateBlock;

          item.valueOfGroup = relativeGroup;
          item.templateBlock = templateBlock;
        }
      }
    }

    return group;
  }

}
