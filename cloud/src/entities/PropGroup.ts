import { PropGroupStructType } from "@grootio/common";
import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropItem } from "./PropItem";

@Entity()
export class PropGroup extends BaseEntity {

  @Property({ length: 20 })
  name: string;

  /**
   * 属性编辑器最顶层配置组
   */
  @Property()
  root = true;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  /**
   * Flat 没有配置块这一层，直接展示配置项
   * Default 直接下级为配置块，配置块直接下级为配置项
   */
  @Property({ type: 'tinyint' })
  struct: PropGroupStructType = PropGroupStructType.Default;

  @Property({ columnType: 'double' })
  order: number;

  /**
   * 其下配置块默认继承该属性
   */
  @Property({ length: 20 })
  propKey?: string;

  /**
   * 关联配置项，层级结构时需要通过该值查找上级配置项
   */
  @ManyToOne({ serializer: value => value?.id, serializedName: 'parentItemId' })
  parentItem?: PropItem;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  parentItemId?: number;

  @Property({ persist: false })
  componentVersionId?: number;

  @Property({ persist: false })
  componentId?: number;
}