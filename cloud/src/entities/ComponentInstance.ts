import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { Release } from "./Release";
import { StudioValue } from "./StudioValue";

@Entity()
export class ComponentInstance extends BaseEntity {

  @Property()
  name: string;

  @ManyToOne()
  component: Component;

  @ManyToOne()
  componentVersion: ComponentVersion;

  @Property()
  path?: string;

  @OneToMany(() => StudioValue, studioValue => studioValue.componentInstance)
  valueList = new Collection<StudioValue>(this);

  @ManyToMany(() => Release, release => release.instanceList, { owner: true })
  releaseList = new Collection<Release>(this);

  @OneToMany(() => ComponentInstance, instance => instance.parentInstance)
  subInstanceList = new Collection<ComponentInstance>(this);

  @ManyToOne()
  parentInstance?: ComponentInstance;
}
