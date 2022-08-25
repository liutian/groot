import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropValue } from "./PropValue";
import { Release } from "./Release";

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


  @OneToMany(() => PropValue, propValue => propValue.componentInstance)
  valueList = new Collection<PropValue>(this);

  /**
 * 一个实例可以被多个迭代引用，只有组件版本升级会导致实例变化
 */
  @ManyToOne({ serializer: value => value?.id, serializedName: 'releaseId' })
  release: Release;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'parentInstanceId' })
  parentInstance?: ComponentInstance;

  @Property({ persist: false })
  componentId?: number;

  @Property({ persist: false })
  releaseId?: number;

  @Property({ persist: false })
  componentVersionId?: number;
}
