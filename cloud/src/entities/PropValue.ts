import { Collection, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { PropItem } from "./PropItem";
import { Component } from "./Component";
import { Scaffold } from "./Scaffold";
import { Application } from "./Application";
import { Project } from "./Project";

@Entity()
export class PropValue extends BaseEntity {

  @ManyToOne({ serializer: value => value?.id, serializedName: 'propItemId' })
  propItem: PropItem;

  @Property({ length: 5000 })
  value: string;

  @ManyToMany(() => ComponentInstance, instance => instance.propValueList, { owner: true })
  componentInstanceList = new Collection<ComponentInstance>(this);

  @Property({ length: 5000 })
  parentIds?: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'applicationId' })
  application?: Application;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'projectId' })
  project?: Project;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'scaffoldId' })
  scaffold: Scaffold;

}
