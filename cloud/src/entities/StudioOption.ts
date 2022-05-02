import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { StudioItem } from './StudioItem';
@Entity()
export class StudioOption extends BaseEntity {

  @Property()
  label: string;

  @Property()
  value: string;

  @ManyToOne()
  studioItem: StudioItem;
}