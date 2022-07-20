import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { ComponentVersion } from "./ComponentVersion";
import { Application } from "./Application";
import { Release } from "./Release";

@Entity()
export class Component extends BaseEntity {

  @Property({ length: 100 })
  name: string;

  /**
   * 组件所属包名
   */
  @Property({ length: 100 })
  packageName: string;

  /**
   * 组件名
   */
  @Property({ length: 100 })
  componentName: string;

  /**
   * 是否是页面级组件
   */
  @Property()
  page = true;

  /**
   * 组件版本列表
   */
  @OneToMany(() => ComponentVersion, version => version.component)
  versionList = new Collection<ComponentVersion>(this);

  /**
   * 组件最新版本
   */
  @OneToOne({ serializer: value => value?.id, serializedName: 'recentVersionId' })
  recentVersion?: ComponentVersion;// 此处必须为可选，否则创建组建会引发recentVersion非空校验

  @ManyToOne()
  application: Application;

  @Property({ persist: false })
  version: ComponentVersion;

  @Property({ persist: false })
  instance: ComponentInstance;

  @Property({ persist: false })
  release: Release;

  @Property({ persist: false })
  releaseList: Release[];
}
