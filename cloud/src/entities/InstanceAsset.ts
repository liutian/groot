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

  // 和ComponentInstance.key关联
  @Property({ length: 100 })
  key: string;
}