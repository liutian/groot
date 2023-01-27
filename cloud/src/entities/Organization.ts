import { Collection, Entity, ManyToMany, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { Plugin } from "./Plugin";
@Entity()
export class Organization extends BaseEntity {

  @Property({ length: 20 })
  name: string;

  // 调试各种功能的演练场接受外部窗口传来调试参数
  @Property({ length: 100 })
  playgroundPath: string;

  @Property({ length: 100 })
  debugBaseUrl: string;

  @ManyToMany()
  pluginList = new Collection<Plugin>(this);

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  componentList: Component[];

}