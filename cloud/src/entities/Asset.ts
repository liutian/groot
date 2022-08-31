import { AssetType } from "@grootio/common";
import { Entity, Enum, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Asset extends BaseEntity {

  @Enum()
  type: AssetType;

  @Property({ type: 'text' })
  content: string;

  @Property()
  relativeId: number;
}