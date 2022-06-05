import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { Component } from './Component';
import { ComponentVersion } from './ComponentVersion';
import { PropItem } from './PropItem';
@Entity()
export class PropValueOption extends BaseEntity {

  @Property()
  label: string;

  @Property()
  value: string;

  @ManyToOne()
  propItem: PropItem;

  @ManyToOne()
  componentVersion: ComponentVersion;

  @ManyToOne()
  component: Component;
}