import { Cascade, Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropBlock } from "./PropBlock";
import { PropGroup } from "./PropGroup";
import { PropValueOption } from "./PropValueOption";

@Entity()
export class PropItem extends BaseEntity {

  @Property({ length: 100 })
  label: string;

  @Property({ length: 50 })
  propKey: string;

  @Enum()
  type: PropItemType;

  @Property({ length: 1024 })
  defaultValue?: string;

  /**
   * 类型为多选，单选，下拉框时所对应选项列表
   */
  @OneToMany({ entity: () => PropValueOption, mappedBy: option => option.propItem, cascade: [Cascade.ALL], orphanRemoval: true })
  optionList = new Collection<PropValueOption>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'blockId' })
  block: PropBlock;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'groupId' })
  group: PropGroup;

  /**
   * 显示宽度，24格
   */
  @Property()
  span = 24;

  /**
   * 类型为 List Item时，所属下级配置组
   */
  @OneToOne({ serializer: value => value?.id, serializedName: 'valueOfGroupId' })
  valueOfGroup?: PropGroup;

  /**
   * 类型为 List 时，所属下级配置块模版 todo 是否可以删除该字段
   */
  @ManyToOne({ serializer: value => value?.id, serializedName: 'templateBlockId' })
  templateBlock?: PropBlock;

  /**
   * 类型为 Item 时，所属下级配置块 todo 是否可以删除该字段
   */
  @ManyToOne({ serializer: value => value?.id, serializedName: 'directBlockId' })
  directBlock?: PropBlock;

  /**
   * 是否是组件根属性，如果为true则不会继承父级配置块
   */
  @Property()
  rootPropKey = false;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @Property({ columnType: 'double' })
  order: number;

  @Property({ persist: false })
  blockId?: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  /**
   * 联动镜像改变该配置块也随之改变，方便批量操作
   */
  @ManyToOne({ serializer: value => value?.id, serializedName: 'imagePropItemId' })
  imagePropItem?: PropItem;
}

export enum PropItemType {
  INPUT = 'Input',
  DATE_PICKER = 'Date_Picker',
  SWITCH = 'Switch',
  SELECT = 'Select',
  RADIO = 'Radio',
  CHECKBOX = 'Checkbox',
  LIST = 'List',
  ITEM = 'Item'
}