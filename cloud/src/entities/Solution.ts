import { Collection, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Extension } from "./Extension";
import { Organization } from "./Organization";

@Entity()
export class Solution extends BaseEntity {

  @Property({ length: 20 })
  name: string;

  // 调试各种功能的演练场接受外部窗口传来调试参数
  @Property({ length: 100, comment: ' 调试功能的演练场页面地址，可以接受外部窗口传来调试参数' })
  playgroundPath: string;

  @Property({ length: 100, comment: '前端页面开发调试地址' })
  debugBaseUrl: string;

  @ManyToMany()
  extensionList = new Collection<Extension>(this);

  @ManyToOne({ serializer: value => value?.id, serializedName: 'orgId' })
  org: Organization;
}