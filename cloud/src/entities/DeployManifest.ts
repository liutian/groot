import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Bundle } from "./Bundle";
import { Release } from "./Release";

@Entity()
export class DeployManifest extends BaseEntity {

  @Property({ type: 'text', lazy: true })
  content: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'releaseId' })
  release: Release;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'bundleId' })
  bundle: Bundle;

}