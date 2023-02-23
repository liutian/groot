import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Organization } from "./Organization";

@Entity()
export class Extension extends BaseEntity {

  @Property({ length: 30 })
  name: string;

  @Property({ length: 30, comment: 'webpack模块联邦模块名' })
  packageName: string;

  @Property({ length: 100, comment: 'webpack模块联邦暴露出来可访问js地址' })
  packageUrl: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'orgId' })
  org: Organization;
}