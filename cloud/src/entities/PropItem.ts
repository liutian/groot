import { Entity, Enum, ManyToOne, OneToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropBlock } from "./PropBlock";
import { PropGroup } from "./PropGroup";
import { PropItemType } from '@grootio/common';

@Entity()
export class PropItem extends BaseEntity {

  @Property({ length: 100 })
  label: string;

  @Property({ length: 50 })
  propKey?: string;

  @Enum()
  type: PropItemType;

  @Property({ length: 1024 })
  defaultValue?: string;

  /**
   * 类型为多选，单选，下拉框时所对应选项列表，json化存储
   */
  @Property({ length: 10000 })
  valueOptions?: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'blockId' })
  block: PropBlock;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'groupId' })
  group: PropGroup;

  /**
   * 显示宽度，24格
   */
  @Property()
  span = 24;

  /**
   * 类型为Hierarchy Item时，所属下级配置组
   */
  @OneToOne({ serializer: value => value?.id, serializedName: 'childGroupId' })
  childGroup?: PropGroup;

  /**
   * 是否是组件根属性，如果为true则不会继承父级配置块
   */
  @Property()
  rootPropKey = false;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @Property({ columnType: 'double' })
  order: number;

  @Property({ persist: false })
  blockId?: number;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  /**
   * 版本升级时，确认当前propItem是否被改动的判断条件
   * 上一个版本versionTraceId，如果为空则是上一个版本对应propItem 的 ID
   * 如果propItem属性变化，则重置versionTraceId为当前ID
   */
  @Property()
  versionTraceId?: number;
}

