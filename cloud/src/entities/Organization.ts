import { Entity, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";

@Entity()
export class Organization extends BaseEntity {

  @Property({ length: 50 })
  name: string;

  // 调试各种功能的演练场接受外部窗口传来调试参数
  @Property({ length: 100 })
  playgroundPath: string;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  componentList: Component[];

}