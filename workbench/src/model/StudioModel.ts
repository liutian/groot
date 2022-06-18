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

  public propItemStack: PropItem[] = [];

  private noRootPropGroupMap = new Map<number, PropGroup>();

  public currEnv: 'dev' | 'qa' | 'pl' | 'online' = 'dev';

  public iframeRef?: { current: HTMLIFrameElement };

  public init(component: Component, iframeRef: { current: HTMLIFrameElement }, editMode = false) {
    this.component = component;
    this.iframeRef = iframeRef;
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

  /**
 * 配置项变动通知iframe更新
 */
  public notifyIframe = (content: string) => {
    const props = content;

    this.iframeRef?.current?.contentWindow?.postMessage({
      type: 'refresh',
      path: this.component.instance!.path,
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
        const block = this.getPropBlock(blockId)!;
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
    newGroup.componentId = this.component.id;
    newGroup.componentVersionId = this.component.version.id;

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
      ).then(r => r.json()).then((result: { data: PropGroup }) => {
        this.component.version.rootGroupList!.push(result.data);
        // this.component.version.groupList.push(result.data);
        this.activeGroupId = result.data.id;
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
      const group = this.getPropGroup(groupId)!;
      result.data.groupList.forEach((group) => {
        this.noRootPropGroupMap.set(group.id, group);
      });

      this.buildPropGroup(group, {
        groupList: result.data.groupList,
        blockList: result.data.blockList,
        itemList: result.data.itemList
      });
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
      }).then(r => r.json()).then((result: { data: PropItem[] }) => {
        for (let index = 0; index < result.data.length; index++) {
          const propItem = result.data[index]!;
          const block = this.getPropBlock(propItem.blockId)!;
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
        console.dir(this.component.version.rootGroupList);
      })
    }

    this.currSettingPropItem = undefined;

    setTimeout(() => {
      this.productStudioData();
    }, 100)
  }

  private addPropItemFn = (data: { newItem: PropItem, valueOfGroup: PropGroup, templateBlock: PropBlock }) => {
    const block = this.getPropBlock(data.newItem.blockId)!;
    block.propItemList.push(data.newItem);
    if (data.newItem.type === 'array-object') {
      const valueOfGroup = data.valueOfGroup;
      const templateBlock = data.templateBlock;
      this.noRootPropGroupMap.set(data.valueOfGroup.id, valueOfGroup);

      valueOfGroup.propBlockList = valueOfGroup.propBlockList.filter(b => b.id !== templateBlock.id);
      valueOfGroup.templateBlock = templateBlock;
      data.newItem.templateBlock = templateBlock;
      data.newItem.valueOfGroup = valueOfGroup;
    }
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

  public delItem = (itemId: number) => {
    fetch(`${serverPath}/item/remove/${itemId}`).then(r => r.json()).then((result: { data: PropItem[] }) => {
      for (let index = 0; index < result.data.length; index++) {
        const itemData = result.data[index]!;
        const block = this.getPropBlock(itemData.blockId)!;
        let itemIndex = block.propItemList.findIndex(item => item.id === itemData.id);
        block.propItemList.splice(itemIndex, 1);
      }
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
    this.propItemStack?.push(item);
  }

  public popHandUpPropItem = () => {
    this.propItemStack.pop();
  }

  public getPropGroup = (groupId: number) => {
    let group = this.component.version.rootGroupList!.find((group) => {
      return group.id === groupId;
    })

    return group || this.noRootPropGroupMap.get(groupId);
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

    const tempGroups = [...this.noRootPropGroupMap.values()];
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

  private buildPropGroup(groupIdOrObj: number | PropGroup,
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

    if (group.propBlockList?.length) {
      group.propBlockList.push(...blocks);
    } else {
      group.propBlockList = blocks;
    }
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex]!;
      const items = store.itemList
        .filter(i => i.groupId === group.id && i.blockId === block.id)
        .sort((a, b) => a.order - b.order)

      if (block.propItemList?.length) {
        block.propItemList.push(...items);
      } else {
        block.propItemList = items;
      }

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const item = items[itemIndex]!;
        if (item.type === 'array-object') {
          const relativeGroup = this.buildPropGroup(item.valueOfGroupId!, store);
          this.noRootPropGroupMap.set(relativeGroup.id, relativeGroup);
          let templateBlock = relativeGroup.propBlockList.find(b => b.id === item.templateBlockId);
          if (!templateBlock) {
            templateBlock = this.getPropBlock(item.templateBlockId!);
          }
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
