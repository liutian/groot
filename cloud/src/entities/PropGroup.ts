import { PropGroupStructType } from "@grootio/common";
import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropBlock } from "./PropBlock";
import { PropItem } from "./PropItem";

@Entity()
export class PropGroup extends BaseEntity {

  @Property({ length: 50 })
  name: string;

  /**
   * 只有根配置组可以在页面上以tab方式展示
   */
  @Property()
  root = true;

  /**
   * 组件属性，其下配置块默认继承该属性
   */
  @Property({ length: 50 })
  propKey?: string;

  @OneToMany(() => PropBlock, block => block.group)
  propBlockList = new Collection<PropBlock>(this);

  /**
   * 关联配置项，层级结构时需要通过该值查找上级配置项
   */
  @ManyToOne({ serializer: value => value?.id, serializedName: 'parentItemId' })
  parentItem?: PropItem;

  @Property({ persist: false })
  parentItemId?: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @Property({ persist: false })
  componentVersionId?: number;

  @Property({ columnType: 'double' })
  order: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  @Property({ persist: false })
  componentId?: number;

  /**
   * Item 其下没有配置块这一层，直接展示配置项
   * Default 直接下级为配置块，配置块直接下级为配置项
   */
  @Property()
  struct: PropGroupStructType = PropGroupStructType.Default
}