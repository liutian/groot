import { PropBlockLayout, PropBlockStructType } from "@grootio/common";
import { Collection, Entity, Enum, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
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
   * 是否是组件根属性，如果为true则不会继承父级配置组
   */
  @Property()
  rootPropKey = false;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'groupId' })
  group: PropGroup;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @Enum()
  layout: PropBlockLayout = PropBlockLayout.Horizontal;

  @Enum()
  struct: PropBlockStructType = PropBlockStructType.Default;

  @Property({ columnType: 'double' })
  order: number;

  @Property({ length: 1000 })
  listStructData?: string;

  /**
   * 组件属性，其下配置项默认继承该属性
   */
  @Property({ length: 50 })
  propKey?: string;

  @OneToMany(() => PropItem, item => item.block)
  propItemList = new Collection<PropItem>(this);

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  groupId?: number;
}