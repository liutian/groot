import { Collection, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { PropItem } from "./PropItem";
import { Component } from "./Component";

@Entity()
export class PropValue extends BaseEntity {

  /**
   * 属性链
   */
  @Property({ length: 100 })
  keyChain: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'propItemId' })
  propItem: PropItem;

  @Property({ length: 1024 })
  value: string;

  @ManyToMany(() => ComponentInstance, instance => instance.propValueList, { owner: true })
  componentInstanceList = new Collection<ComponentInstance>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;
}
