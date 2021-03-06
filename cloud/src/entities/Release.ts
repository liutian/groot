import { Collection, Entity, ManyToMany, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { Application } from "./Application";

@Entity()
export class Release extends BaseEntity {

  @Property({ length: 100 })
  name: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'applicationId' })
  application: Application;

  /**
   * 是否冻结，true组件实例不能在调整，online环境自动设置为true
   */
  @Property()
  freeze = false;

  @ManyToMany(() => ComponentInstance, componentInstance => componentInstance.releaseList)
  instanceList = new Collection<ComponentInstance>(this);
}
