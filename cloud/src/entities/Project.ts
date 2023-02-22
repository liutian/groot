import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Organization } from "./Organization";

@Entity()
export class Project extends BaseEntity {

  @Property({ length: 20 })
  name: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'orgId' })
  org: Organization;
}