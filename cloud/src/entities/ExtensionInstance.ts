import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Extension } from "./Extension";

@Entity()
export class ExtensionInstance extends BaseEntity {

  @ManyToOne({ serializer: value => value?.id, serializedName: 'extensionId' })
  extension: Extension;

  // @todo 考虑去json，改为结构化
  @Property({ length: 1000 })
  config: string;

}