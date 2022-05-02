import { Collection, Entity, Enum, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentStudio } from "./ComponentStudio";
import { StudioBlock } from "./StudioBlock";
import { StudioGroup } from "./StudioGroup";
import { StudioOption } from "./StudioOption";

@Entity()
export class StudioItem extends BaseEntity {

  @Property()
  label: string;

  @Property()
  propKey?: string;

  @Enum()
  type: StudioItemType;

  @Property({ length: 1024 })
  value: string;

  @Property({ length: 1024 })
  defaultValue?: string;

  @OneToMany(() => StudioOption, option => option.studioItem)
  options = new Collection<StudioOption>(this);

  @ManyToOne()
  block: StudioBlock;

  @ManyToOne()
  group: StudioGroup;

  @Property()
  span: number = 24;

  @ManyToOne()
  valueOfGroup?: StudioGroup;

  @ManyToOne()
  templateBlock?: StudioBlock;

  @Property()
  isRootPropKey: boolean = false;

  @ManyToOne()
  componentStudio: ComponentStudio;
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