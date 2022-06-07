import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropGroup } from "./PropGroup";
import { PropItem } from "./PropItem";

@Entity()
export class PropBlock extends BaseEntity {

  @Property()
  name: string;

  @Property()
  propKey?: string;

  @OneToMany(() => PropItem, item => item.block)
  propItemList = new Collection<PropItem>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'groupId' })
  group: PropGroup;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'relativeItemId' })
  relativeItem?: PropItem;

  @Property()
  rootPropKey = false;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @Property({ persist: false })
  groupId?: number;

  // 模版配置块order 为-1000，方便区分费模版配置块
  @Property({ columnType: 'double' })
  order: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  @Property()
  isTemplate = false;
}