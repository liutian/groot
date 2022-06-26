import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropGroup } from "./PropGroup";
import { PropItem } from "./PropItem";

@Entity()
export class PropBlock extends BaseEntity {

  @Property({ length: 50 })
  name: string;

  /**
   * 组件属性，其下配置项默认继承该属性
   */
  @Property({ length: 50 })
  propKey?: string;

  @OneToMany(() => PropItem, item => item.block)
  propItemList = new Collection<PropItem>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'groupId' })
  group: PropGroup;

  /**
   * 关联配置项，层级结构时需要通过该值查找上级配置项
   */
  @ManyToOne({ serializer: value => value?.id, serializedName: 'relativeItemId' })
  relativeItem?: PropItem;

  /**
   * 是否是组件根属性，如果为true则不会继承父级配置组
   */
  @Property()
  rootPropKey = false;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @Property({ persist: false })
  groupId?: number;

  @Property({ columnType: 'double' })
  order: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  /**
   * 是否是模版类型的配置块
   */
  @Property()
  isTemplate = false;

  /**
   * 联动镜像改变该配置块也随之改变，方便批量操作
   */
  @ManyToOne({ serializer: value => value?.id, serializedName: 'imagePropBlockId' })
  imagePropBlock?: PropBlock;
}