import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { StudioBlock } from "./StudioBlock";
import { StudioGroup } from "./StudioGroup";
import { StudioItem } from "./StudioItem";

@Entity()
export class ComponentVersion extends BaseEntity {

  @Property()
  name: string;

  @ManyToOne()
  component: Component;

  @Property()
  publish = false;

  @Property({ persist: false })
  groupList?: StudioGroup[];

  @Property({ persist: false })
  blockList?: StudioBlock[];

  @Property({ persist: false })
  itemList?: StudioItem[];
}