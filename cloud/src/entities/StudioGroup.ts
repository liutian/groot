import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentVersion } from "./ComponentVersion";
import { StudioBlock } from "./StudioBlock";
import { StudioItem } from "./StudioItem";

@Entity()
export class StudioGroup extends BaseEntity {

  @Property()
  name: string;

  @Property()
  isRoot = true;

  @Property()
  propKey?: string;

  @OneToMany(() => StudioBlock, block => block.group)
  propBlockList = new Collection<StudioBlock>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'relativeItemId' })
  relativeItem?: StudioItem;

  @OneToOne({ serializer: value => value?.id, serializedName: 'templateBlockId' })
  templateBlock?: StudioBlock;

  @ManyToOne()
  componentVersion: ComponentVersion;

  @Property({ persist: false })
  componentVersionId?: number;

  @Property({ columnType: 'double' })
  order: number;
}