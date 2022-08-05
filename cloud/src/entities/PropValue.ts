import { Collection, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { Component } from "./Component";
import { Scaffold } from "./Scaffold";
import { Application } from "./Application";
import { Project } from "./Project";
import { PropValueType } from "@grootio/common";
import { ComponentVersion } from "./ComponentVersion";
import { PropItem } from "./PropItem";

@Entity()
export class PropValue extends BaseEntity {

  @ManyToOne({ serializer: value => value?.id, serializedName: 'propItemId' })
  propItem: PropItem;

  @Property({ persist: false })
  propItemId?: number;

  @Property({ length: 1000 })
  value?: string;

  @ManyToMany(() => ComponentInstance, instance => instance.propValueList, { owner: true })
  componentInstanceList = new Collection<ComponentInstance>(this);

  @Property({ length: 1000 })
  propValueIdChainForBlockListStruct?: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  @Property({ persist: false })
  componentId?: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @Property({ persist: false })
  componentVersionId?: number;

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

  @Property()
  order?: number;
}
