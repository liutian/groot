import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropBlock } from "./PropBlock";
import { PropItem } from "./PropItem";

@Entity()
export class PropGroup extends BaseEntity {

  @Property()
  name: string;

  /**
   * 只有根配置组可以在页面上以tab方式展示
   */
  @Property()
  root = true;

  @Property()
  propKey?: string;

  @OneToMany(() => PropBlock, block => block.group)
  propBlockList = new Collection<PropBlock>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'relativeItemId' })
  relativeItem?: PropItem;

  @OneToOne({ serializer: value => value?.id, serializedName: 'templateBlockId' })
  templateBlock?: PropBlock;

  @ManyToOne()
  componentVersion: ComponentVersion;

  @Property({ persist: false })
  componentVersionId?: number;

  @Property({ columnType: 'double' })
  order: number;

  @ManyToOne()
  component: Component;
}