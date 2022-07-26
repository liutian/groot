import { PropItemType } from "@grootio/common";
import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";

@Entity()
export class CodeMeta extends BaseEntity {

  @Property()
  key: string;

  @Property({ length: 1024 })
  defaultValue: string;

  @Enum()
  type: PropItemType

  @ManyToOne()
  componentInstance: ComponentInstance;
}
