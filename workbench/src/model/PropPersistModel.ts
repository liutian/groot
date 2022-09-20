import { PropItemType, PropValueType, } from "@grootio/common";

import { assignBaseType, autoIncrementForName, calcPropValueIdChain, stringifyOptions } from "@util/utils";
import { APIPath } from "api/API.path";
import request from "@util/request";
import PropHandleModel from "./PropHandleModel";
import WorkbenchModel from "./WorkbenchModel";

/**
 * 负责属性编辑器涉及到的接口调用，以及相关UI状态
 */
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
  /**
   * 模态层请求提交中
   */
  public settingModalSubmitting = false;

  private workbench: WorkbenchModel;
  private propHandle: PropHandleModel

  public inject(workbench: WorkbenchModel, propHandle: PropHandleModel) {
    this.workbench = workbench;
    this.propHandle = propHandle;
  }

  public movePropBlock = (group: PropGroup, originIndex: number, up: boolean) => {
    const originBlock = group.propBlockList[originIndex];
    const targetId = up ? group.propBlockList[originIndex - 1].id : group.propBlockList[originIndex + 1].id;

    request(APIPath.move_position, {
      originId: originBlock.id,
      targetId,
      type: 'block'
    }).then(() => {
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

    request(APIPath.move_position, {
      originId: +dragId,
      targetId: hoverId === '__add' ? null : +hoverId,
      type: 'group'
    }).then(() => {
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

    request(APIPath.move_position, {
      originId: originItem.id,
      targetId,
      type: 'item'
    }).then(() => {
      if (up) {
        const targetItem = block.propItemList[originIndex - 1];
        block.propItemList[originIndex - 1] = originItem;
        block.propItemList[originIndex] = targetItem;
      } else {
        const targetItem = block.propItemList[originIndex + 1];
        block.propItemList[originIndex + 1] = originItem;
        block.propItemList[originIndex] = targetItem;
      }
    });
  }

  public updateOrAddPropGroup = (group: PropGroup) => {
    const newGroup = Object.assign(this.currSettingPropGroup, group);
    newGroup.componentId = this.workbench.component.id;
    newGroup.componentVersionId = this.workbench.component.version.id;

    this.settingModalSubmitting = true;
    if (newGroup.id) {
      request(APIPath.group_update, newGroup).then(() => {
        let groupIndex = this.propHandle.rootGroupList.findIndex(g => g.id === newGroup.id);
        // this.propHandle.rootGroupList.splice(groupIndex, 1, newGroup);
        assignBaseType(this.propHandle.rootGroupList[groupIndex], newGroup);

        this.settingModalSubmitting = false;
        this.currSettingPropGroup = undefined;
        this.workbench.iframeManager.refreshComponent(this.workbench.component);
      })
    } else {
      request(APIPath.group_add, newGroup).then(({ data }) => {
        // todo
        data.expandBlockIdList = [];
        data.propBlockList = [];
        this.propHandle.rootGroupList.push(data);
        this.propHandle.activeGroupId = data.id;

        this.settingModalSubmitting = false;
        this.currSettingPropGroup = undefined;
        this.workbench.iframeManager.refreshComponent(this.workbench.component);
      })
    }
  }

  public updateOrAddPropBlock = (block: PropBlock) => {
    const newBlock = Object.assign(this.currSettingPropBlock, block);
    const group = this.propHandle.getPropGroup(newBlock.groupId);

    this.settingModalSubmitting = true;
    if (newBlock.id) {
      request(APIPath.block_update, newBlock).then(() => {
        let blockIndex = group.propBlockList.findIndex(b => b.id === newBlock.id);
        // group.propBlockList.splice(blockIndex, 1, newBlock);
        assignBaseType(group.propBlockList[blockIndex], newBlock);
        this.settingModalSubmitting = false;
        this.currSettingPropBlock = undefined;
        this.workbench.iframeManager.refreshComponent(this.workbench.component);
      });
    } else {
      request(APIPath.block_add, newBlock).then(({ data: { newBlock, extra } }) => {
        group.propBlockList.push(newBlock);
        newBlock.group = group;
        newBlock.propItemList = [];
        group.expandBlockIdList.push(newBlock.id);

        if (extra?.childGroup) {
          extra.childGroup.expandBlockIdList = [];
          extra.childGroup.propBlockList = [];
          extra.newItem.childGroup = extra.childGroup;
          extra.newItem.valueList = [];

          newBlock.propItemList = [extra.newItem];
          extra.newItem.block = newBlock;
          extra.childGroup.parentItem = extra.newItem;
        }

        this.settingModalSubmitting = false;
        this.currSettingPropBlock = undefined;
        this.workbench.iframeManager.refreshComponent(this.workbench.component);
      })

    }
  }

  public updateOrAddPropItem = (item: PropItem) => {
    const newItem = Object.assign(this.currSettingPropItem, item);

    const typesOfHasOption = [PropItemType.Select, PropItemType.Radio, PropItemType.Checkbox, PropItemType.Button_Group] as string[];
    if (!typesOfHasOption.includes(newItem.type)) {
      newItem.optionList = undefined;
    } else {
      stringifyOptions(newItem);
    }

    this.settingModalSubmitting = true;
    if (newItem.id) {
      request(APIPath.item_update, newItem).then(({ data }) => {
        const block = this.propHandle.getPropBlock(data.blockId);
        let itemIndex = block.propItemList.findIndex(item => item.id === data.id);
        // block.propItemList.splice(itemIndex, 1, propItem);
        assignBaseType(block.propItemList[itemIndex], data);

        this.settingModalSubmitting = false;
        this.currSettingPropItem = undefined;
        this.workbench.iframeManager.refreshComponent(this.workbench.component);
      });
    } else {
      request(APIPath.item_add, newItem).then(({ data: { newItem, childGroup } }) => {
        newItem.valueList = [];
        const block = this.propHandle.getPropBlock(newItem.blockId);
        block.propItemList.push(newItem);
        newItem.block = block;
        const group = this.propHandle.getPropGroup(block.groupId);
        group.expandBlockIdList.push(block.id);

        if (childGroup) {
          childGroup.expandBlockIdList = [];
          childGroup.propBlockList = [];
          newItem.childGroup = childGroup;
          childGroup.parentItem = newItem;
        }

        this.settingModalSubmitting = false;
        this.currSettingPropItem = undefined;
        this.workbench.iframeManager.refreshComponent(this.workbench.component);
      })
    }
  }

  public delGroup = (groupId: number) => {
    request(APIPath.group_remove, { groupId }).then(() => {
      const index = this.propHandle.rootGroupList.findIndex(g => g.id === groupId);

      this.propHandle.rootGroupList.splice(index, 1);

      if (this.propHandle.activeGroupId === groupId) {
        this.propHandle.activeGroupId = this.propHandle.rootGroupList[0]?.id;
      }
      this.workbench.iframeManager.refreshComponent(this.workbench.component);
    })
  }

  public delBlock = (blockId: number, group: PropGroup) => {
    request(APIPath.block_remove, { blockId }).then(() => {
      let blockIndex = group.propBlockList.findIndex(b => b.id === blockId);
      group.propBlockList.splice(blockIndex, 1);
      this.workbench.iframeManager.refreshComponent(this.workbench.component);
    })
  }

  public delItem = (itemId: number, block: PropBlock) => {
    request(APIPath.item_remove, { itemId }).then(() => {
      let itemIndex = block.propItemList.findIndex(item => item.id === itemId);
      block.propItemList.splice(itemIndex, 1);
      this.workbench.iframeManager.refreshComponent(this.workbench.component);
    })
  }

  public showPropBlockSettinngForCreate = (group: PropGroup) => {
    const nameSuffix = autoIncrementForName(group.propBlockList.map(b => b.name));

    this.currSettingPropBlock = {
      name: `配置块${nameSuffix}`,
      groupId: group.id,
    } as PropBlock;
  }

  public showPropItemSettinngForCreate = (block: PropBlock) => {
    const nameSuffix = autoIncrementForName(block.propItemList.map(item => item.label));
    const propSuffix = autoIncrementForName(block.propItemList.map(item => item.propKey));

    this.currSettingPropItem = {
      type: 'text',
      label: `配置项${nameSuffix}`,
      propKey: `prop${propSuffix}`,
      blockId: block.id,
      groupId: block.groupId,
      span: 24,
    } as PropItem;
  }

  public saveBlockListPrimaryItem(propBlock: PropBlock, data: number[]) {
    request(APIPath.block_listStructPrimaryItem_save, {
      blockId: propBlock.id,
      data: JSON.stringify(data)
    }).then(() => {
      propBlock.listStructData = data;
      this.propHandle.popPropItemFromStack(propBlock.propItemList[0]);
    })
  }

  public addAbstractTypeValue = (propItem: PropItem) => {
    const abstractValueIdChain = calcPropValueIdChain(propItem);

    const paramsData = {
      propItemId: propItem.id,
      abstractValueIdChain,
      componentVersionId: this.workbench.component.version.id,
      componentId: this.workbench.component.id,
      scaffoldId: this.workbench.component.scaffoldId
    } as PropValue;

    if (this.workbench.prototypeMode) {
      paramsData.type = PropValueType.Prototype;
    } else {
      paramsData.type = PropValueType.Instance;
      paramsData.releaseId = this.workbench.application.release.id;
      paramsData.componentInstanceId = this.workbench.componentInstance.id;
    }

    request(APIPath.value_abstractType_add, paramsData).then(({ data }) => {
      propItem.valueList.push(data);
      this.workbench.iframeManager.refreshComponent(this.workbench.component);
    })
  }

  public removeBlockListStructChildItem = (propValueId: number, propItem: PropItem) => {
    request(APIPath.value_abstractType_remove, { propValueId }).then(() => {
      propItem.valueList = propItem.valueList.filter(v => v.id !== propValueId);
      this.workbench.iframeManager.refreshComponent(this.workbench.component);
    })
  }

  public updateValue = (propItem: PropItem, value: any, abstractValueId?: number) => {
    const abstractValueIdChain = calcPropValueIdChain(propItem, abstractValueId);
    const propValue = propItem.valueList.find(value => value.abstractValueIdChain === abstractValueIdChain);

    let paramData = {} as PropValue;

    const valueStr = JSON.stringify(value);

    if (propValue) {
      paramData.id = propValue.id;
      paramData.value = valueStr;
    } else {

      paramData.abstractValueIdChain = abstractValueIdChain;
      paramData.propItemId = propItem.id;
      paramData.componentId = this.workbench.component.id;
      paramData.componentVersionId = this.workbench.component.version.id;
      paramData.scaffoldId = this.workbench.component.scaffoldId;
      paramData.value = valueStr;

      if (this.workbench.prototypeMode) {
        paramData.type = PropValueType.Prototype;
      } else {
        paramData.type = PropValueType.Instance;
        paramData.releaseId = this.workbench.application.release.id;
        paramData.componentInstanceId = this.workbench.componentInstance.id;
      }
    }

    request(APIPath.value_update, paramData).then(({ data }) => {
      if (propValue) {
        propValue.value = valueStr;
      } else if ((paramData as any).type === 'instance') {
        propItem.valueList.push(data);
      } else if (abstractValueIdChain) {
        propItem.valueList.push(data);
      } else {
        propItem.defaultValue = valueStr;
      }

      this.workbench.iframeManager.refreshComponent(this.workbench.component);
    });
  }
}
