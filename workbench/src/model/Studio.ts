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
  /**
  * 当前正在配置的配置块或者配置项需要插入的位置
  */
  public currSettingInsertIndex: number = -1;

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
            defaultValue: values[item.propKey]
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
        this.componentStudio.rootGroups.splice(groupIndex, 1, JSON.parse(JSON.stringify(newGroup)));

        groupIndex = this.componentStudio.allGroups.findIndex(g => g.id === newGroup.id);
        this.componentStudio.allGroups.splice(groupIndex, 1, JSON.parse(JSON.stringify(newGroup)));
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
      ).then(r => r.json()).then(({ data: groupData }: { data: CodeMetaStudioGroup }) => {

        this.componentStudio.allGroups.push(JSON.parse(JSON.stringify(groupData)));
        groupData.propBlocks.forEach((block) => {
          this.componentStudio.allBlocks.push(JSON.parse(JSON.stringify(block)));
          block.propItems.forEach((item) => {
            this.componentStudio.allItems.push(JSON.parse(JSON.stringify(item)));
          })
        })
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
        group.propBlocks.splice(blockIndex, 1, { ...newBlock });

        blockIndex = this.componentStudio.allBlocks.findIndex(b => b.id === newBlock.id);
        this.componentStudio.allBlocks.splice(blockIndex, 1, { ...newBlock });
      });
    } else {
      const moveBlockId = this.currSettingInsertIndex >= group.propBlocks.length - 1 ? null : group.propBlocks[this.currSettingInsertIndex + 1]!.id
      fetch(`${serverPath}/block/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moveBlockId,
          ...newBlock
        })
      }).then(r => r.json()).then(({ data: blockData }: { data: CodeMetaStudioBlock }) => {
        group?.propBlocks.splice(this.currSettingInsertIndex + 1, 0, blockData);

        blockData.propItems.forEach((item) => {
          this.componentStudio.allItems.push(JSON.parse(JSON.stringify(item)));
        });
        this.componentStudio.allBlocks.push(JSON.parse(JSON.stringify(blockData)))
      })

    }
    this.currSettingStudioBlock = undefined;
  }

  public updateOrAddStudioItem = (item: CodeMetaStudioItem) => {
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
      } as CodeMetaStudioItem;
      const blockChild = {
        id: uuid(),
        name: '配置块1',
        propItems: [itemChild]
      } as CodeMetaStudioBlock;
      const groupChild = {
        id: uuid(),
        name: '',
        propBlocks: [blockChild],
        isRoot: false
      } as CodeMetaStudioGroup;

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

        itemIndex = this.componentStudio.allItems.findIndex(item => item.id === newItem.id);
        this.componentStudio.allItems.splice(itemIndex, 1, JSON.parse(JSON.stringify(newItem)));
      });
    } else {
      const block = this.getStudioBlock(newItem.blockId)!;
      const moveItemId = this.currSettingInsertIndex >= block.propItems.length - 1 ? null : block.propItems[this.currSettingInsertIndex + 1]?.id
      fetch(`${serverPath}/item/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moveItemId,
          ...newItem
        })
      }).then(r => r.json()).then(({ data: itemData }: { data: CodeMetaStudioItem }) => {
        block.propItems.splice(this.currSettingInsertIndex + 1, 0, itemData);
        this.componentStudio.allItems.push(JSON.parse(JSON.stringify(itemData)));
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
      const group = this.componentStudio.rootGroups[index]!;

      group.propBlocks.forEach((block) => {
        block.propItems.forEach((item) => {
          const itemIndex = this.componentStudio.allItems.findIndex(i => i.id === item.id);
          this.componentStudio.allItems.splice(itemIndex, 1);
        });
        const blockIndex = this.componentStudio.allBlocks.findIndex(b => b.id == block.id);
        this.componentStudio.allBlocks.splice(blockIndex, 1);
      });
      const groupIndex = this.componentStudio.allGroups.findIndex(g => g.id === group.id);
      this.componentStudio.allGroups.splice(groupIndex, 1);
      this.componentStudio.rootGroups.splice(index, 1);

      if (this.activeGroupId === groupId) {
        this.activeGroupId = this.componentStudio.rootGroups[0]?.id;
      }
    })
  }

  public delBlock = (blockId: number, group: CodeMetaStudioGroup) => {
    fetch(`${serverPath}/block/remove/${blockId}`).then(() => {
      let blockIndex = group.propBlocks.findIndex(b => b.id === blockId);
      const block = group.propBlocks[blockIndex]!;
      group.propBlocks.splice(blockIndex, 1);

      block.propItems.forEach((item) => {
        const itemIndex = this.componentStudio.allItems.findIndex(i => i.id === item.id);
        this.componentStudio.allItems.splice(itemIndex, 1);
      });

      blockIndex = this.componentStudio.allBlocks.findIndex(b => b.id === blockId);
      this.componentStudio.allBlocks.splice(blockIndex, 1);
    })
  }

  public delItem = (itemId: number, block: CodeMetaStudioBlock) => {
    fetch(`${serverPath}/item/remove/${itemId}`).then(() => {
      let itemIndex = block.propItems.findIndex(item => item.id === itemId);
      block.propItems.splice(itemIndex, 1);

      itemIndex = this.componentStudio.allItems.findIndex(item => item.id === itemId);
      this.componentStudio.allItems.splice(itemIndex, 1);
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
      for (let blockIndex = 0; blockIndex < group!.propBlocks.length; blockIndex++) {
        const block = group?.propBlocks[blockIndex];
        if (block?.id === blockId) {
          return block;
        }
      }
    }

    return undefined;
  }

  public showStudioBlockSettinngForCreate = (relativeBlock: CodeMetaStudioBlock, group: CodeMetaStudioGroup, inner: boolean, innerTemplateBlock: CodeMetaStudioBlock) => {
    if (inner) {
      const newBlock = JSON.parse(JSON.stringify(innerTemplateBlock)) as CodeMetaStudioBlock;
      newBlock.id = 0;
      newBlock.name = `配置块${group.propBlocks.length + 1}`;
      newBlock.groupId = group.id;
      this.currSettingStudioBlock = newBlock;
    } else {
      const nameSuffix = autoIncrementForName(group.propBlocks.map(b => b.name));

      this.currSettingStudioBlock = {
        id: 0,
        name: `配置块${nameSuffix}`,
        groupId: group.id,
        propItems: [],
        order: 0
      };
    }
    this.currSettingInsertIndex = group.propBlocks.findIndex(b => b.id === relativeBlock.id);
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
