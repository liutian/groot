import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { CodeMeta } from "./CodeMeta";
import { ComponentStudio } from "./ComponentStudio";

@Entity()
export class Component extends BaseEntity {

  @Property()
  name: string;

  @ManyToOne()
  studio: ComponentStudio;

  @OneToMany(() => CodeMeta, codeMeta => codeMeta.component)
  codeMetaData = new Collection<CodeMeta>(this);
}