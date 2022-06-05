import { Collection, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { PropItem } from "./PropItem";
import { Component } from "./Component";

@Entity()
export class PropValue extends BaseEntity {

  @Property()
  keyChain?: string;

  @ManyToOne()
  propItem: PropItem;

  @Property()
  value: string;

  @ManyToMany(() => ComponentInstance, instance => instance.propValueList, { owner: true })
  componentInstanceList = new Collection<ComponentInstance>(this);

  @ManyToOne()
  component: Component;
}
