import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { Application } from "./Application";

@Entity()
export class Release extends BaseEntity {

  @Property({ length: 50 })
  name: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'applicationId' })
  application: Application;

  /**
   * 是否归档，true组件实例不能在调整，关联online环境时，上一个release自动设置为true
   */
  @Property()
  archive = false;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  instanceList: ComponentInstance[];

  @Property({ persist: false })
  imageReleaseId: number;
}
