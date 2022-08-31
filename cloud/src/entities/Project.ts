import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Project extends BaseEntity {

  @Property({ length: 100 })
  name: string;

}