import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class StudioBlock extends BaseEntity {

  @Property()
  title: string;

  @Property()
  propKey: string;

}