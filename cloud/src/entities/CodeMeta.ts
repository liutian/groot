import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { StudioItemType } from "./StudioItem";

@Entity()
export class CodeMeta extends BaseEntity {

  @Property()
  key: string;

  @Property({ length: 1024 })
  defaultValue: string;

  @Enum()
  type: StudioItemType

  @ManyToOne()
  component: Component;
}
