import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
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
   * 是否归档，true组件实例不能在调整，关联online环境时，上一个release自动设置为true
   */
  @Property()
  archive = false;

  @Property({ persist: false })
  imageReleaseId: number;

  @OneToMany(() => ComponentInstance, componentInstance => componentInstance.release)
  instanceList = new Collection<ComponentInstance>(this);

}
