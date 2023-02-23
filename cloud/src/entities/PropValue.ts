import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { PropValueType, ValueStruct } from "@grootio/common";

import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { Component } from "./Component";
import { ComponentVersion } from "./ComponentVersion";
import { PropItem } from "./PropItem";

@Entity()
export class PropValue extends BaseEntity {

  @Property({ type: 'tinyint' })
  type: PropValueType;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'propItemId' })
  propItem: PropItem;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentId' })
  component: Component;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'instanceId' })
  componentInstance?: ComponentInstance;

  @Property({ length: 1000 })
  value = '';

  @Property({ length: 100 })
  abstractValueIdChain = '';

  @Property({ columnType: 'double' })
  order = 0;

  @Property({ type: 'tinyint' })
  valueStruct: ValueStruct = ValueStruct.Common;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  propItemId?: number;

  @Property({ persist: false })
  componentId?: number;

  @Property({ persist: false })
  componentVersionId?: number;

  // @Property({ persist: false })
  // orgId?: number;

  @Property({ persist: false })
  releaseId?: number;

  @Property({ persist: false })
  componentInstanceId?: number;
}
