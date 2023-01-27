import { Release, StateType } from "@grootio/common";
import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";

@Entity()
export class State extends BaseEntity {
  @Property({ length: 20 })
  name: string;

  @Property({ length: 200 })
  value?: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'instanceId' })
  componentInstance?: ComponentInstance;

  @Enum({ type: 'tinyint' })
  type: StateType = StateType.Str;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'releaseId' })
  release: Release;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  instanceId?: number;

  @Property({ persist: false })
  releaseId?: number;
}