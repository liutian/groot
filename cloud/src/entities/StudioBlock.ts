import { Collection, Entity, ManyToOne, OneToMany, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentStudio } from "./ComponentStudio";
import { StudioGroup } from "./StudioGroup";
import { StudioItem } from "./StudioItem";

@Entity()
export class StudioBlock extends BaseEntity {

  @Property()
  name: string;

  @Property()
  propKey?: string;

  @OneToMany(() => StudioItem, item => item.block)
  propItems = new Collection<StudioItem>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'groupId' })
  group: StudioGroup;

  @OneToOne({ serializer: value => value?.id, serializedName: 'relativeItemId' })
  relativeItem?: StudioItem;

  @Property()
  isRootPropKey: boolean = false;

  @ManyToOne()
  componentStudio: ComponentStudio;

  @Property({ persist: false })
  componentStudioId?: number;

  @Property({ persist: false })
  groupId?: number;

  // 模版配置块order 为-1000，方便区分费模版配置块
  @Property({ columnType: 'double' })
  order: number;
}