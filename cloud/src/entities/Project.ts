import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Release } from "./Release";

@Entity()
export class Project extends BaseEntity {

  @Property({ length: 100 })
  name: string;

  // 此处必须为可选，否则创建project会引发devRelease非空校验
  @ManyToOne()
  devRelease?: Release;

  // 此处必须为可选，否则创建project会引发qaRelease非空校验
  @ManyToOne()
  qaRelease?: Release;

  // 此处必须为可选，否则创建project会引发plRelease非空校验
  @ManyToOne()
  plRelease?: Release;

  // 此处必须为可选，否则创建project会引发onlineRelease非空校验
  @ManyToOne()
  onlineRelease?: Release;

  @OneToMany(() => Release, release => release.project)
  releaseList = new Collection<Release>(this);

}