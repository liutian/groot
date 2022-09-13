import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { PropBlock } from "./PropBlock";
import { PropGroup } from "./PropGroup";
import { PropItem } from "./PropItem";
import { PropValue } from "./PropValue";

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

  @OneToMany(() => PropGroup, group => group.componentVersion)
  groupList = new Collection<PropGroup>(this);

  @OneToMany(() => PropBlock, block => block.componentVersion)
  blockList = new Collection<PropBlock>(this);

  @OneToMany(() => PropItem, item => item.componentVersion)
  itemList = new Collection<PropItem>(this);

  /**
   * 列表类型配置块，其下配置项值默认值必须而外通过PropValue存储
   */
  @OneToMany(() => PropValue, value => value.componentVersion)
  valueList = new Collection<PropValue>(this);

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  imageVersionId?: number;
}