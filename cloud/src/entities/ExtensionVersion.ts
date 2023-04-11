import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Extension } from "./Extension";

@Entity()
export class ExtensionVersion extends BaseEntity {

  @Property({ length: 30 })
  name: string;

  // @todo 考虑去json，改为结构化
  @Property({ length: 1000 })
  defaultConfig: string;

  @Property({ length: 30, comment: 'webpack模块联邦包名' })
  packageName: string;

  @Property({ length: 30, comment: 'webpack模块联邦模块名' })
  moduleName: string;

  // todo 保证扩展根据assetUrl全局唯一
  @Property({ length: 100, comment: 'webpack模块联邦暴露出来可访问js地址' })
  assetUrl: string;

  @Property({ type: 'text', lazy: true })
  propItemPipeline = '';

  @Property({ type: 'text', lazy: true })
  propItemPipelineRaw = '';

  @ManyToOne({ serializer: value => value?.id, serializedName: 'extensionId' })
  extension: Extension;

  //************************已下是接口入参或者查询返回需要定义的属性************************
}