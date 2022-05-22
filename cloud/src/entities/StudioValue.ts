import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { Release } from "./Release";
import { StudioItem } from "./StudioItem";

@Entity()
export class StudioValue extends BaseEntity {

  @Property()
  keyChain?: string;

  @ManyToOne()
  studioItem: StudioItem;

  @Property()
  value: string;

  @ManyToOne()
  componentInstance: ComponentInstance;

  @ManyToOne()
  release: Release;
}
