import { DeployStatusType, EnvType } from "@grootio/common";
import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { Application } from "./Application";
import { BaseEntity } from "./BaseEntity";
import { Release } from "./Release";
import { ReleaseAsset } from "./ReleaseAsset";

@Entity()
export class Deploy extends BaseEntity {

  @ManyToOne()
  release: Release;

  @ManyToOne()
  application: Application;

  @ManyToOne()
  asset: ReleaseAsset;

  @Enum()
  env: EnvType;

  @Property()
  status: DeployStatusType;

}
