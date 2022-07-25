import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";

@Entity()
export class Scaffold extends BaseEntity {

  @Property({ length: 100 })
  name: string;

  @Property({ persist: false })
  componentList: Component[];

  @Property({ length: 100 })
  playgroundPath: string;
}