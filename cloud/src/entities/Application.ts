import { Collection, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Plugin } from "./Plugin";
import { Project } from "./Project";
import { Release } from "./Release";

@Entity()
export class Application extends BaseEntity {

  @Property({ length: 20 })
  name: string;

  @Property({ length: 20 })
  key: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'projectId' })
  project: Project;

  // 调试应用各种功能的演练场接受外部窗口传来调试参数
  @Property({ length: 100 })
  playgroundPath: string;

  // 此处必须为可选，否则创建application会引发devRelease非空校验
  @ManyToOne({ serializer: value => value?.id, serializedName: 'devReleaseId' })
  devRelease: Release = { id: 0 } as any;

  // 此处必须为可选，否则创建application会引发qaRelease非空校验
  @ManyToOne({ serializer: value => value?.id, serializedName: 'qaeleaseId' })
  qaRelease: Release = { id: 0 } as any;

  // 此处必须为可选，否则创建application会引发plRelease非空校验
  @ManyToOne({ serializer: value => value?.id, serializedName: 'plReleaseId' })
  plRelease: Release = { id: 0 } as any;

  // 此处必须为可选，否则创建application会引发onlineRelease非空校验
  @ManyToOne({ serializer: value => value?.id, serializedName: 'onlineReleaseId' })
  onlineRelease: Release = { id: 0 } as any;

  @ManyToMany()
  pluginList = new Collection<Plugin>(this);

  @Property({ length: 100 })
  debugBaseUrl: string;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  release: Release;

  @Property({ persist: false })
  releaseList: Release[];

  @Property({ persist: false })
  devReleaseId: number;

  @Property({ persist: false })
  qaReleaseId: number;

  @Property({ persist: false })
  plReleaseId: number;

  @Property({ persist: false })
  onlineReleaseId: number;

}