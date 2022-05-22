import { Collection, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { Project } from "./Project";

@Entity()
export class Release extends BaseEntity {

  @Property({ length: 1024 })
  name: string;

  @ManyToOne()
  project: Project;

  @Property()
  lock = false;

  @ManyToMany(() => ComponentInstance, componentInstance => componentInstance.releaseList)
  instanceList = new Collection<ComponentInstance>(this);
}
