import { Collection, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { PropItem } from "./PropItem";
import { Component } from "./Component";
import { Scaffold } from "./Scaffold";
import { Application } from "./Application";
import { Project } from "./Project";
import { PropValueType } from "@grootio/common";

@Entity()
export class PropValue extends BaseEntity {

  @ManyToOne({ serializer: value => value?.id, serializedName: 'propItemId' })
  propItem: PropItem;

  @Property({ persist: false })
  propItemId?: number;

  @Property({ length: 5000 })
  value?: string;

  @ManyToMany(() => ComponentInstance, instance => instance.propValueList, { owner: true })
  componentInstanceList = new Collection<ComponentInstance>(this);

  @Property({ length: 5000 })
  parentIdChain?: string;

  @Property()
  parentId?: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  @Property({ persist: false })
  componentId?: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'applicationId' })
  application?: Application;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'projectId' })
  project?: Project;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'scaffoldId' })
  scaffold: Scaffold;

  @Property({ persist: false })
  scaffoldId?: number;

  @Property()
  type: PropValueType = PropValueType.Default;
}
