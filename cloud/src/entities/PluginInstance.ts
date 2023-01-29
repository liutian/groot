import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Plugin } from "./Plugin";

@Entity()
export class PluginInstance extends BaseEntity {

  @ManyToOne({ serializer: value => value?.id, serializedName: 'pluginId' })
  plugin: Plugin;

  // @todo 考虑去json，改为结构化
  @Property({ length: 1000 })
  config: string;

}