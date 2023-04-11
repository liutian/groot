import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, Property } from "@mikro-orm/core";

import { BundleAsset } from "./BundleAsset";
import { BaseEntity } from "./BaseEntity";
import { Release } from "./Release";
import { Application } from "./Application";

@Entity()
export class Bundle extends BaseEntity {

  @ManyToOne({ serializer: value => value?.id, serializedName: 'applicationId' })
  application: Application;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'releaseId' })
  release: Release;

  @ManyToMany()
  newAssetList = new Collection<BundleAsset>(this);

  @ManyToMany()
  oldAssetList = new Collection<BundleAsset>(this);

  @Property({ length: 100 })
  remark = '';
}
