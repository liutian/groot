import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";

import { Application } from "./Application";
import { InstanceAsset } from "./InstanceAsset";
import { BaseEntity } from "./BaseEntity";
import { Release } from "./Release";

@Entity()
export class Bundle extends BaseEntity {


  @ManyToOne()
  application: Application;

  @ManyToOne()
  release: Release;

  @OneToMany(() => InstanceAsset, asset => asset.bundle)
  newAssetList = new Collection<InstanceAsset>(this);

  @OneToMany(() => InstanceAsset, asset => asset.bundle)
  oldAssetList = new Collection<InstanceAsset>(this);

  @Property({ length: 100 })
  remark = '';
}
