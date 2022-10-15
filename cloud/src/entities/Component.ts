import { WrapperType } from "@grootio/common";
import { Entity, Enum, ManyToOne, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentVersion } from "./ComponentVersion";
import { PropBlock } from "./PropBlock";
import { PropGroup } from "./PropGroup";
import { PropItem } from "./PropItem";
import { PropValue } from "./PropValue";
import { Release } from "./Release";
import { Scaffold } from "./Scaffold";

@Entity()
export class Component extends BaseEntity {

  @Property({ length: 50 })
  name: string;

  /**
   * 组件注册时的包名
   */
  @Property({ length: 50 })
  packageName: string;

  /**
   * 组件注册时的组件名
   */
  @Property({ length: 50 })
  componentName: string;

  /**
   * 是否是容器组件
   */
  @Property()
  container = false;

  /**
   * 组件最新版本，此处必须为可选，否则创建组建会引发recentVersion非空校验
   */
  @OneToOne({ serializer: value => value?.id, serializedName: 'recentVersionId' })
  recentVersion?: ComponentVersion;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'scaffoldId' })
  scaffold: Scaffold;

  @Enum()
  wrapperType: WrapperType = WrapperType.Block;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  /**
   * 组件版本列表
   */
  @Property({ persist: false })
  versionList: ComponentVersion[];

  @Property({ persist: false })
  componentVersion: ComponentVersion;

  @Property({ persist: false })
  release: Release;

  @Property({ persist: false })
  releaseList: Release[];

  @Property({ persist: false })
  scaffoldId?: number;

  @Property({ persist: false })
  groupList?: PropGroup[];

  @Property({ persist: false })
  blockList?: PropBlock[];

  @Property({ persist: false })
  itemList?: PropItem[];

  @Property({ persist: false })
  valueList?: PropValue[];
}
