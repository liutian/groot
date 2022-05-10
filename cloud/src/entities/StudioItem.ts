import { Cascade, Collection, Entity, Enum, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
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

  @OneToMany({ entity: () => StudioOption, mappedBy: option => option.studioItem, cascade: [Cascade.ALL] })
  options = new Collection<StudioOption>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'blockId' })
  block: StudioBlock;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'groupId' })
  group: StudioGroup;

  @Property()
  span: number = 24;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'valueOfGroupId' })
  valueOfGroup?: StudioGroup;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'templateBlockId' })
  templateBlock?: StudioBlock;

  @Property()
  isRootPropKey: boolean = false;

  @ManyToOne()
  componentStudio: ComponentStudio;

  @Property({ columnType: 'double' })
  order: number;

  @Property({ persist: false })
  blockId?: number;
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