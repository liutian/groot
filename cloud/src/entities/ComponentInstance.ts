import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { Release } from "./Release";
import { PropValue } from "./PropValue";

@Entity()
export class ComponentInstance extends BaseEntity {

  @Property({ length: 100 })
  name: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  /**
   * 页面类型组件对应页面地址
   */
  @Property({ length: 100 })
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

  @ManyToOne({ serializer: value => value?.id, serializedName: 'parentInstanceId' })
  parentInstance?: ComponentInstance;

  @Property({ persist: false })
  componentId: number;
}
