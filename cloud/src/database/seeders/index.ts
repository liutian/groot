import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ComponentVersion } from '../../entities/ComponentVersion';
import { Component } from '../../entities/Component';
import { PropItem, PropItemType } from '../../entities/PropItem';
import { PropBlock } from '../../entities/PropBlock';
import { PropGroup } from '../../entities/PropGroup';
import { Application } from '../../entities/Application';
import { Release } from '../../entities/Release';
import { ComponentInstance } from '../../entities/ComponentInstance';
import { PropValue } from '../../entities/PropValue';
import { Scaffold } from '../../entities/Scaffold';

export class DatabaseSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {

    const application = em.create(Application, {
      name: '管理系统',
      serverUrl: 'https://demo.com',
      playgroundPath: '/admin/groot/playground'
    });
    await em.persistAndFlush(application);

    const release = em.create(Release, {
      name: '0.0.1',
      application
    });
    application.devRelease = release;
    application.qaRelease = release;
    application.plRelease = release;
    application.onlineRelease = release;
    await em.persistAndFlush(release);

    const scaffold = em.create(Scaffold, {
      name: 'demo',
    });
    await em.persistAndFlush(scaffold);

    const component = em.create(Component, {
      name: '列表查询',
      packageName: 'ant',
      componentName: 'Button',
      scaffold
    });
    await em.persistAndFlush(component);

    const componentVersion = em.create(ComponentVersion, {
      name: 'v0.0.1',
      component
    });
    component.recentVersion = componentVersion;
    await em.persistAndFlush(componentVersion);

    const group = em.create(PropGroup, {
      name: '配置组',
      order: 1000,
      componentVersion,
      component
    });
    await em.persistAndFlush(group);

    const block = em.create(PropBlock, {
      name: '配置块',
      group,
      componentVersion,
      order: 1000,
      component
    })
    await em.persistAndFlush(block);

    const item = em.create(PropItem, {
      label: '配置项',
      propKey: 'prop',
      type: PropItemType.INPUT,
      block,
      group,
      componentVersion,
      order: 1000,
      component
    })
    await em.persistAndFlush(item);

    const instance = em.create(ComponentInstance, {
      name: '用户查询页面',
      path: '/user/list',
      component,
      componentVersion
    });
    instance.releaseList.add(release);
    await em.persistAndFlush(instance);

    const propValue = em.create(PropValue, {
      propItem: item,
      value: 'hello',
      component,
      keyChain: ''
    });
    propValue.componentInstanceList.add(instance);
    await em.persistAndFlush(propValue);
  }
}