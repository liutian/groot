import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { ComponentVersion } from "./ComponentVersion";
import { SolutionVersion } from "./SolutionVersion";

@Entity()
export class SolutionEntry extends BaseEntity {
  @Property({ length: 20 })
  name: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'solutionVersionId' })
  solutionVersion: SolutionVersion;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'componentVersionId' })
  componentVersion: ComponentVersion;

  //************************已下是接口入参或者查询返回需要定义的属性************************


}