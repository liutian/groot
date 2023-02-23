import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { DeployStatusType, EnvType } from "@grootio/common";

import { Application } from "./Application";
import { BaseEntity } from "./BaseEntity";
import { Bundle } from "./Bundle";
import { Release } from "./Release";
import { DeployManifest } from "./DeployManifest";

@Entity()
export class Deploy extends BaseEntity {

  @ManyToOne()
  release: Release;

  @ManyToOne()
  application: Application;

  @ManyToOne()
  manifest: DeployManifest;

  @Property({ type: 'tinyint' })
  env: EnvType;

  @Property({ type: 'tinyint' })
  status: DeployStatusType;

  @ManyToOne()
  bundle: Bundle;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  // @Property({ persist: false })
  // bundleId?: number
}
