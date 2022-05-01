import { ManyToOne, Property } from '@mikro-orm/core';
import { StudioItem } from './StudioItem';

export class StudioOption {

  @Property()
  label: string;

  @Property()
  value: string;

  @ManyToOne()
  studioItem: StudioItem;
}