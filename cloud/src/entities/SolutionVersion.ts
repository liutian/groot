import { Collection, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { ComponentVersion } from "./ComponentVersion";
import { Solution } from "./Solution";

@Entity()
export class SolutionVersion extends BaseEntity {

  @Property({ length: 20 })
  name: string;

  // 调试各种功能的演练场接受外部窗口传来调试参数
  @Property({ length: 100, comment: ' 调试功能的演练场页面地址，可以接受外部窗口传来调试参数' })
  playgroundPath: string;

  @Property({ length: 100, comment: '前端页面开发调试地址' })
  debugBaseUrl: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'solutionId' })
  solution: Solution;

  @ManyToMany()
  componentVersionList = new Collection<ComponentVersion>(this);

  //************************已下是接口入参或者查询返回需要定义的属性************************

}