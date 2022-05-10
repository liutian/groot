import { PrimaryKey, Property } from '@mikro-orm/core';

export abstract class BaseEntity {

  @PrimaryKey()
  id!: number;

  @Property({ lazy: true })
  createdAt = new Date();

  @Property({ onUpdate: () => new Date(), lazy: true })
  updatedAt = new Date();


}
