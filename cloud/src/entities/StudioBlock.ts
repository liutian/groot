import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentVersion } from "./ComponentVersion";
import { StudioGroup } from "./StudioGroup";
import { StudioItem } from "./StudioItem";

@Entity()
export class StudioBlock extends BaseEntity {

  @Property()
  name: string;

  @Property()
  propKey?: string;

  @OneToMany(() => StudioItem, item => item.block)
  propItemList = new Collection<StudioItem>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'groupId' })
  group: StudioGroup;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'relativeItemId' })
  relativeItem?: StudioItem;

  @Property()
  isRootPropKey = false;

  @ManyToOne()
  componentVersion: ComponentVersion;

  @Property({ persist: false })
  componentVersionId?: number;

  @Property({ persist: false })
  groupId?: number;

  // 模版配置块order 为-1000，方便区分费模版配置块
  @Property({ columnType: 'double' })
  order: number;
}