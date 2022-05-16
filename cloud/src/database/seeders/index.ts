import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ComponentStudio } from '../../entities/ComponentStudio';
import { Component } from '../../entities/Component';
import { Page } from '../../entities/Page';
import { StudioItem, StudioItemType } from '../../entities/StudioItem';
import { StudioBlock } from '../../entities/StudioBlock';
import { StudioGroup } from '../../entities/StudioGroup';

export class DatabaseSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {

    const studio = em.create(ComponentStudio, {
      name: 'demo1',
      packageName: 'ant',
      componentName: 'Button',
      moduleName: 'Button_demo',
    });
    await em.persistAndFlush(studio);

    const component = em.create(Component, {
      name: 'demo1',
      studio
    });
    await em.persistAndFlush(component);

    const page = em.create(Page, {
      name: 'demo1',
      url: 'demo1',
      path: 'demo1',
      component
    });
    await em.persistAndFlush(page);

    const group = em.create(StudioGroup, {
      name: '配置组',
      componentStudio: component,
      order: 1000,
      isRoot: true
    });
    await em.persistAndFlush(group);

    const block = em.create(StudioBlock, {
      name: '配置块',
      group,
      componentStudio: component,
      order: 1000
    })
    await em.persistAndFlush(block);

    const item = em.create(StudioItem, {
      label: '配置项',
      propKey: 'prop',
      type: StudioItemType.INPUT,
      block,
      group,
      componentStudio: component,
      order: 1000,
      value: ''
    })
    await em.persistAndFlush(item);
  }
}