import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";

@Entity()
export class Scaffold extends BaseEntity {

  @Property({ length: 50 })
  name: string;

  @Property({ length: 100 })
  playgroundPath: string;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  componentList: Component[];

}