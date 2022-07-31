import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { Application } from "./Application";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Project extends BaseEntity {

  @Property({ length: 100 })
  name: string;

  @OneToMany(() => Application, app => app.project)
  applicationList = new Collection<Application>(this);

}