import { Collection, Entity, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentVersion } from "./ComponentVersion";

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

  @Property({ persist: false })
  version?: ComponentVersion;
}
