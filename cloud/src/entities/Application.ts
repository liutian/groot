import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Project } from "./Project";
import { Release } from "./Release";

@Entity()
export class Application extends BaseEntity {

  @Property({ length: 100 })
  name: string;

  // 此处必须为可选，否则创建application会引发devRelease非空校验
  @ManyToOne()
  devRelease?: Release;

  // 此处必须为可选，否则创建application会引发qaRelease非空校验
  @ManyToOne()
  qaRelease?: Release;

  // 此处必须为可选，否则创建application会引发plRelease非空校验
  @ManyToOne()
  plRelease?: Release;

  // 此处必须为可选，否则创建application会引发onlineRelease非空校验
  @ManyToOne()
  onlineRelease?: Release;

  @OneToMany(() => Release, release => release.application)
  releaseList = new Collection<Release>(this);

  @Property({ length: 100 })
  remoteFrontEndUrl: string;

  @Property({ length: 100 })
  playgroundPath: string;

  @Property({ persist: false })
  release: Release;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'projectId' })
  project: Project;

}