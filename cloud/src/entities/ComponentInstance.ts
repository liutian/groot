import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropValue } from "./PropValue";
import { Release } from "./Release";

@Entity()
export class ComponentInstance extends BaseEntity {

  @Property({ length: 50 })
  name: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'releaseId' })
  release: Release;

  /**
   * 一般为组件实例第一次创建时的ID，多个版本迭代实例重新创建，但是trackI永远复制上一个版本的，保证多版本迭代之间还可以追溯组件实例的历史记录
   */
  @Property()
  trackId: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'parentId' })
  parent?: ComponentInstance;

  /**
   * 页面地址，可选
   */
  @Property({ length: 100 })
  path?: string;

  /**
   * 组件属性值
   */
  @OneToMany(() => PropValue, propValue => propValue.componentInstance)
  valueList = new Collection<PropValue>(this);

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  componentId?: number;

  @Property({ persist: false })
  releaseId?: number;

  @Property({ persist: false })
  componentVersionId?: number;

  @Property({ persist: false })
  oldChildId?: number;

}
