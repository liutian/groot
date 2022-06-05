import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { PropBlock } from "./PropBlock";
import { PropGroup } from "./PropGroup";
import { PropItem } from "./PropItem";

@Entity()
export class ComponentVersion extends BaseEntity {

  @Property()
  name: string;

  @ManyToOne()
  component: Component;

  @Property()
  publish = false;

  @Property({ persist: false })
  groupList?: PropGroup[];

  @Property({ persist: false })
  blockList?: PropBlock[];

  @Property({ persist: false })
  itemList?: PropItem[];
}