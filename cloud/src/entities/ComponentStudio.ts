import { Collection, Entity, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { group } from "console";
import { BaseEntity } from "./BaseEntity";
import { StudioBlock } from "./StudioBlock";
import { StudioGroup } from "./StudioGroup";
import { StudioItem } from "./StudioItem";

@Entity()
export class ComponentStudio extends BaseEntity {

  @Property()
  name: string;

  @Property()
  packageName: string;

  @Property()
  moduleName: string;

  @Property()
  componentName: string;

  @Property({ persist: false })
  allGroups: StudioGroup[];

  @Property({ persist: false })
  allBlocks: StudioBlock[];

  @Property({ persist: false })
  allItems: StudioItem[];
}