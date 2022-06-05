import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { PropBlock } from "./PropBlock";
import { PropGroup } from "./PropGroup";
import { PropItem } from "./PropItem";

@Entity()
export class ComponentVersion extends BaseEntity {

  @Property()
  name: string;

  @ManyToOne()
  component: Component;

  /**
   * 组件版本发布之后，禁止修改配置
   */
  @Property()
  publish = false;

  @OneToMany(() => PropGroup, group => group.componentVersion)
  groupList = new Collection<PropGroup>(this);

  @OneToMany(() => PropBlock, block => block.componentVersion)
  blockList = new Collection<PropBlock>(this);

  @OneToMany(() => PropItem, item => item.componentVersion)
  itemList = new Collection<PropItem>(this);
}