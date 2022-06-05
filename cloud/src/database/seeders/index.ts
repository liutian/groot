import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ComponentVersion } from '../../entities/ComponentVersion';
import { Component } from '../../entities/Component';
import { PropItem, PropItemType } from '../../entities/PropItem';
import { PropBlock } from '../../entities/PropBlock';
import { PropGroup } from '../../entities/PropGroup';
import { Project } from '../../entities/Project';
import { Release } from '../../entities/Release';
import { ComponentInstance } from '../../entities/ComponentInstance';
import { PropValue } from '../../entities/PropValue';

export class DatabaseSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {

    const project = em.create(Project, {
      name: '管理系统'
    });
    await em.persistAndFlush(project);

    const release = em.create(Release, {
      name: '0.0.1',
      project
    });
    project.devRelease = release;
    project.qaRelease = release;
    project.plRelease = release;
    project.onlineRelease = release;
    await em.persistAndFlush(release);

    const component = em.create(Component, {
      name: '列表查询',
      packageName: 'ant',
      componentName: 'Button',
      moduleName: 'Button_demo',
      project
    });
    await em.persistAndFlush(component);

    const componentVersion = em.create(ComponentVersion, {
      name: 'v0.0.1',
      component
    });
    component.currentVersion = componentVersion;
    await em.persistAndFlush(componentVersion);

    const group = em.create(PropGroup, {
      name: '配置组',
      order: 1000,
      componentVersion
    });
    await em.persistAndFlush(group);

    const block = em.create(PropBlock, {
      name: '配置块',
      group,
      componentVersion,
      order: 1000
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
      componentInstance: instance,
      release
    });
    await em.persistAndFlush(propValue);
  }
}