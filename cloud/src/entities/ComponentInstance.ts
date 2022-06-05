import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { Release } from "./Release";
import { PropValue } from "./PropValue";

@Entity()
export class ComponentInstance extends BaseEntity {

  @Property()
  name: string;

  @ManyToOne()
  component: Component;

  @ManyToOne()
  componentVersion: ComponentVersion;

  /**
   * 页面级组件对应页面地址
   */
  @Property()
  path?: string;

  @ManyToMany(() => PropValue, propValue => propValue.componentInstanceList)
  propValueList = new Collection<PropValue>(this);

  /**
   * 一个实例可以被多个迭代引用，相邻迭代大部分实例基本不会变动，降低数据占用
   */
  @ManyToMany(() => Release, release => release.instanceList, { owner: true })
  releaseList = new Collection<Release>(this);

  @OneToMany(() => ComponentInstance, instance => instance.parentInstance)
  subInstanceList = new Collection<ComponentInstance>(this);

  @ManyToOne()
  parentInstance?: ComponentInstance;
}
