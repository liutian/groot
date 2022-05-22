import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
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
  componentInstance: ComponentInstance;
}
