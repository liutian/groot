import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Bundle } from "./Bundle";
import { Release } from "./Release";

@Entity()
export class ReleaseAsset extends BaseEntity {

  @Property({ type: 'text', lazy: true })
  content: string;

  @ManyToOne()
  release: Release;

  @ManyToOne()
  bundle: Bundle;

}