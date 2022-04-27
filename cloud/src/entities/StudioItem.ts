import { Entity, Enum, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class StudioItem extends BaseEntity {

  @Property()
  title: string;

  @Property()
  propKey: string;

  @Enum()
  type: StudioItemType;
}

export enum StudioItemType {
  INPUT = 'input',
  DATE_PICKER = 'date-picker',
  SWITCH = 'switch',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  ARRAY_OBJECT = 'array-object'
}