import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { Component } from './Component';
import { ComponentVersion } from './ComponentVersion';
import { PropItem } from './PropItem';
@Entity()
export class PropValueOption extends BaseEntity {

  @Property({ length: 50 })
  label: string;

  @Property({ length: 100 })
  value: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'propItemId' })
  propItem: PropItem;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;
}