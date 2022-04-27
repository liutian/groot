import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class StudioGroup extends BaseEntity {

  @Property()
  title: string;

  @Property()
  propKey?: string;

}