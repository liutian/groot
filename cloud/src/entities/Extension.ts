import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Organization } from "./Organization";

@Entity()
export class Extension extends BaseEntity {

  @Property({ length: 30 })
  name: string;

  @Property({ length: 30 })
  packageName: string;

  @Property({ length: 100 })
  packageUrl: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'orgId' })
  org: Organization;
}