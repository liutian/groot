import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentStudio } from "./ComponentStudio";
import { StudioBlock } from "./StudioBlock";
import { StudioItem } from "./StudioItem";

@Entity()
export class StudioGroup extends BaseEntity {

  @Property()
  name: string;

  @Property()
  propKey?: string;

  @OneToMany(() => StudioBlock, block => block.group)
  propBlocks = new Collection<StudioBlock>(this);

  @OneToOne()
  relativeItem?: StudioItem;

  @ManyToOne()
  componentStudio: ComponentStudio;
}