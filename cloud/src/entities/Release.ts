import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { ComponentInstance } from "./ComponentInstance";
import { Application } from "./Application";

@Entity()
export class Release extends BaseEntity {

  @Property({ length: 20 })
  name: string;

  @ManyToOne({ serializer: value => value?.id, serializedName: 'applicationId' })
  application: Application;

  @Property({ comment: '迭代版本是否归档，并限制组件实例修改' })
  archive = false;

  //************************已下是接口入参或者查询返回需要定义的属性************************

  @Property({ persist: false })
  instanceList: ComponentInstance[];

  @Property({ persist: false })
  imageReleaseId: number;
}
