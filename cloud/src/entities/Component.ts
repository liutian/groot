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

  @Property()
  packageName: string;

  @Property()
  moduleName: string;

  @Property()
  componentName: string;

  @Property()
  isPage = true;

  @OneToMany(() => ComponentVersion, studio => studio.component)
  versionList = new Collection<ComponentVersion>(this);

  @OneToOne()
  currentVersion?: ComponentVersion;

  @ManyToOne()
  project: Project;

  @Property({ persist: false })
  version?: ComponentVersion;

  @Property({ persist: false })
  instance?: ComponentInstance;

  @Property({ persist: false })
  release?: Release;
}
