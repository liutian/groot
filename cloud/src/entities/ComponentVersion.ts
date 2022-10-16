import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";

@Entity()
export class ComponentVersion extends BaseEntity {

  @Property({ length: 50 })
  name: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  /**
   * 组件版本发布之后，禁止修改配置
   */
  @Property()
  publish = false;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  imageVersionId?: number;

}