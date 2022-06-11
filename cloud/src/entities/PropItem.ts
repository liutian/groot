import { Cascade, Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropBlock } from "./PropBlock";
import { PropGroup } from "./PropGroup";
import { PropValueOption } from "./PropValueOption";

@Entity()
export class PropItem extends BaseEntity {

  @Property()
  label: string;

  @Property()
  propKey?: string;

  @Enum()
  type: PropItemType;

  @Property({ length: 1024 })
  defaultValue?: string;

  @OneToMany({ entity: () => PropValueOption, mappedBy: option => option.propItem, cascade: [Cascade.ALL], orphanRemoval: true })
  optionList = new Collection<PropValueOption>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'blockId' })
  block: PropBlock;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'groupId' })
  group: PropGroup;

  @Property()
  span = 24;

  @OneToOne({ serializer: value => value?.id, serializedName: 'valueOfGroupId' })
  valueOfGroup?: PropGroup;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'templateBlockId' })
  templateBlock?: PropBlock;

  @Property()
  rootPropKey = false;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @Property({ columnType: 'double' })
  order: number;

  @Property({ persist: false })
  blockId?: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;
}

export enum PropItemType {
  INPUT = 'input',
  DATE_PICKER = 'date-picker',
  SWITCH = 'switch',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  ARRAY_OBJECT = 'array-object'
}