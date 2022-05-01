import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { StudioGroup } from "./StudioGroup";
import { StudioItem } from "./StudioItem";

@Entity()
export class StudioBlock extends BaseEntity {

  @Property()
  name: string;

  @Property()
  propKey: string;

  @OneToMany(() => StudioItem, item => item.block)
  propItems = new Collection<StudioItem>(this);

  @ManyToOne()
  group: StudioGroup;

  @OneToOne()
  relativeItem: StudioItem;

  @Property()
  isRootPropKey: boolean;

}