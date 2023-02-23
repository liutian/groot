import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { BaseEntity } from "./BaseEntity";
import { Bundle } from "./Bundle";
import { ComponentInstance } from "./ComponentInstance";

@Entity()
export class InstanceAsset extends BaseEntity {

  @Property({ type: 'text', lazy: true })
  content: string;

  @ManyToOne()
  componetInstace: ComponentInstance;

  @ManyToOne()
  bundle: Bundle;

  @Property({ length: 100, comment: '和ComponentInstance.key关联' })
  key: string;
}