import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Release } from "./Release";

@Entity()
export class Project extends BaseEntity {

  @Property({ length: 1024 })
  name: string;

  @ManyToOne()
  devRelease?: Release;// 此处必须为可选，否则会造成release和project循环依赖

  @ManyToOne()
  qaRelease?: Release;// 此处必须为可选，否则会造成release和project循环依赖

  @ManyToOne()
  plRelease?: Release;// 此处必须为可选，否则会造成release和project循环依赖

  @ManyToOne()
  onlineRelease?: Release;// 此处必须为可选，否则会造成release和project循环依赖

  @OneToMany(() => Release, release => release.project)
  releaseList = new Collection<Release>(this);

}