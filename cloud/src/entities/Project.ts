import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Release } from "./Release";

@Entity()
export class Project extends BaseEntity {

  @Property({ length: 1024 })
  name: string;

  @ManyToOne()
  devRelease?: Release;

  @ManyToOne()
  qaRelease?: Release;

  @ManyToOne()
  plRelease?: Release;

  @ManyToOne()
  onlineRelease?: Release;

  @OneToMany(() => Release, release => release.project)
  releaseList = new Collection<Release>(this);

}