import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Bundle } from "./Bundle";
import { ComponentInstance } from "./ComponentInstance";

@Entity()
export class BundleAsset extends BaseEntity {

  @Property({ type: 'text', lazy: true })
  content: string;

  @Property({ length: 100, comment: '应用级别唯一标识，保证多次部署可以共用部分构建资源' })
  key: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'entryId' })
  entry: ComponentInstance


  @ManyToOne({ serializer: value => value?.id, serializedName: 'bundleId', comment: '最初创建asset的bundle' })
  bundle: Bundle
}