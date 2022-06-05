import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { Release } from "./Release";
import { PropItem } from "./PropItem";

@Entity()
export class PropValue extends BaseEntity {

  @Property()
  keyChain?: string;

  @ManyToOne()
  propItem: PropItem;

  @Property()
  value: string;

  @ManyToOne()
  componentInstance: ComponentInstance;

  @ManyToOne()
  release: Release;
}
