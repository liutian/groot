import { Entity, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";

@Entity()
export class Plugin extends BaseEntity {

  @Property({ length: 20 })
  name: string;

  @Property({ length: 100 })
  url: string;

}