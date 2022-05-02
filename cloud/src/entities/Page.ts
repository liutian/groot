import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";

@Entity()
export class Page extends BaseEntity {

  @Property()
  name: string;

  @Property({ length: 1024 })
  url: string;

  @Property({ length: 1024 })
  path: string

  @OneToOne()
  component: Component;
}