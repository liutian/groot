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
  isRoot: boolean;

  @Property()
  propKey?: string;

  @OneToMany(() => StudioBlock, block => block.group)
  propBlocks = new Collection<StudioBlock>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'relativeItemId' })
  relativeItem?: StudioItem;

  @OneToOne({ serializer: value => value?.id, serializedName: 'templateBlockId' })
  templateBlock?: StudioBlock;

  @ManyToOne()
  componentStudio: ComponentStudio;

  @Property({ persist: false })
  componentStudioId?: number;

  @Property({ columnType: 'double' })
  order: number;
}