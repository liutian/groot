import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Organization } from "./Organization";

@Entity()
export class Extension extends BaseEntity {

  @Property({ length: 30 })
  name: string;

  @Property({ length: 30 })
  key: string;

  @Property({ length: 100 })
  url: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'orgId' })
  org: Organization;
}