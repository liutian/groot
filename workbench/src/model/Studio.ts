import { uuid } from "@util/utils";
import { FormInstance } from "antd";

export default class Studio {
  /**
   * tab激活的分组
   */
  public activeGroupId: string | undefined = undefined;
  /**
   * 当前配置组
   */
  public currSettingStudioGroup: CodeMetaStudioPropGroup | null = null;
  /**
   * 当前配置块
   */
  public currSettingStudioBlock: CodeMetaStudioPropBlock | null = null;
  public currGroupOfSettingStudioBlock: CodeMetaStudioPropGroup | null = null;
  /**
   * 当前配置项
   */
  public currSettingStudioItem: CodeMetaStudioPropItem | null = null;
  public currBlockOfSettingStudioItem: CodeMetaStudioPropBlock | null = null;

  public currSettingIndex = 0;

  public codeMetaStudio = {} as CodeMetaStudio;
  public settingMode = false;
  public manualMode = false;

  public blockFormInstanceMap = new Map<string, FormInstance>();

  public notifyIframe: Function | undefined;

  public init(studioData: CodeMetaStudio) {
    this.codeMetaStudio = studioData;
    this.settingMode = true;
    this.activeGroupId = studioData.propGroups[0]?.id;
  }

  // todo
  public productStudioData = () => {
    const props: any[] = [];
    this.codeMetaStudio.propGroups.forEach((group) => {
      group.propBlocks.forEach((block) => {
        const values = this.blockFormInstanceMap.get(`${group.id}-${block.id}`)?.getFieldsValue();
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

    const drag = groups.find(g => g.id === dragId)!;
    const hoverIndex = groups.findIndex(g => g.id === hoverId);
    const dragIndex = groups.findIndex(g => g.id === dragId);
    const currentIndex = groups.findIndex(g => g.id === this.activeGroupId);

    groups.splice(hoverIndex, 0, drag);

    if (hoverIndex < dragIndex) {

      groups.splice(dragIndex + 1, 1);
      if (currentIndex >= hoverIndex && currentIndex < dragIndex) {
        this.activeGroupId = groups[currentIndex + 1]?.id;
      } else if (currentIndex === dragIndex) {
        this.activeGroupId = hoverId;
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

    if (!this.currSettingStudioGroup?.id) {
      const id = uuid();
      this.codeMetaStudio.propGroups.push({ ...newGroup, id });
      this.activeGroupId = id;
    } else {
      const groupIndex = this.codeMetaStudio.propGroups.findIndex(g => g.id === newGroup.id);
      this.codeMetaStudio.propGroups.splice(groupIndex!, 1, { ...newGroup });
    }
    this.currSettingStudioGroup = null;
  }

  public updateOrAddStudioBlock = (block: CodeMetaStudioPropBlock) => {
    const newBlock = Object.assign(this.currSettingStudioBlock, block);

    if (!this.currSettingStudioBlock!.id) {
      const id = uuid();
      this.currGroupOfSettingStudioBlock?.propBlocks.splice(this.currSettingIndex + 1, 0, { ...newBlock, id });
    } else {
      const groupIndex = this.currGroupOfSettingStudioBlock?.propBlocks.findIndex(b => b.id === newBlock.id);
      this.currGroupOfSettingStudioBlock?.propBlocks.splice(groupIndex!, 1, { ...newBlock });
    }
    this.currSettingStudioBlock = null;
    this.currGroupOfSettingStudioBlock = null;
  }

  public updateOrAddStudioItem = (blockItem: CodeMetaStudioPropItem) => {
    const newItem = Object.assign(this.currSettingStudioItem, blockItem);

    if (!this.currSettingStudioItem?.id) {
      const id = uuid();
      this.currBlockOfSettingStudioItem?.propItems.splice(this.currSettingIndex + 1, 0, { ...newItem, id });
    } else {
      const groupIndex = this.currBlockOfSettingStudioItem?.propItems.findIndex(item => item.id === newItem.id);
      this.currBlockOfSettingStudioItem?.propItems.splice(groupIndex!, 1, { ...newItem });
    }

    this.currBlockOfSettingStudioItem = null;
    this.currSettingStudioItem = null;

    setTimeout(() => {
      this.productStudioData!();
    }, 100)
  }

  public delGroup = (groupId: string) => {
    const index = this.codeMetaStudio.propGroups.findIndex(g => g.id === groupId);
    this.codeMetaStudio.propGroups.splice(index, 1);
    if (this.activeGroupId === groupId) {
      this.activeGroupId = this.codeMetaStudio.propGroups[0]!.id;
    }
  }

  public switchActiveGroup = (id: string) => {
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
          const values = this.blockFormInstanceMap.get(`${group.id}-${block.id}`)?.getFieldsValue();
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
}
