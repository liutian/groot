import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { ComponentVersion } from "./ComponentVersion";
import { Project } from "./Project";
import { Release } from "./Release";

@Entity()
export class Component extends BaseEntity {

  @Property()
  name: string;

  /**
   * 组件所属包名
   */
  @Property()
  packageName: string;

  /**
   * 组件名
   */
  @Property()
  componentName: string;

  /**
   * 是否是页面级组件
   */
  @Property()
  page = true;

  /**
   * 组件版本
   */
  @OneToMany(() => ComponentVersion, version => version.component)
  versionList = new Collection<ComponentVersion>(this);

  /**
   * 组件最新版本
   */
  @OneToOne()
  currentVersion?: ComponentVersion;// 此处必须为可选，否则会造成component和version循环依赖

  @ManyToOne()
  project: Project;

  @Property({ persist: false })
  version?: ComponentVersion;

  @Property({ persist: false })
  instance?: ComponentInstance;

  @Property({ persist: false })
  release?: Release;
}
