import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ComponentVersion } from '../../entities/ComponentVersion';
import { Component } from '../../entities/Component';
import { PropItem } from '../../entities/PropItem';
import { PropBlock } from '../../entities/PropBlock';
import { PropGroup } from '../../entities/PropGroup';
import { Application } from '../../entities/Application';
import { Release } from '../../entities/Release';
import { Scaffold } from '../../entities/Scaffold';
import { PropBlockLayout, PropBlockStructType, PropItemType } from '@grootio/common';
import { Project } from '../../entities/Project';
import { ComponentInstance } from '../../entities/ComponentInstance';

export class DatabaseSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {

    const project = em.create(Project, {
      name: '后台系统'
    });

    await em.persistAndFlush(project);

    const application = em.create(Application, {
      name: '管理系统',
      remoteFrontEndUrl: 'https://demo.com',
      playgroundPath: '/admin/groot/playground',
      project
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
      playgroundPath: '/admin/groot/playground'
    });
    await em.persistAndFlush(scaffold);



    const component_table = em.create(Component, {
      name: '列表查询',
      packageName: '@ant-design/pro-table',
      componentName: 'ProTable',
      scaffold
    });
    await em.persistAndFlush(component_table);

    const component_table_version = em.create(ComponentVersion, {
      name: 'v0.0.1',
      component: component_table
    });
    component_table.recentVersion = component_table_version;
    await em.persistAndFlush(component_table_version);

    const group1 = em.create(PropGroup, {
      name: '配置组',
      order: 1000,
      componentVersion: component_table_version,
      component: component_table
    });
    await em.persistAndFlush(group1);







    const component = em.create(Component, {
      name: '按钮',
      packageName: 'antd',
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
      component,
      layout: PropBlockLayout.Horizontal,
      struct: PropBlockStructType.Default
    })
    await em.persistAndFlush(block);

    const item = em.create(PropItem, {
      label: '配置项',
      propKey: 'children',
      type: PropItemType.Text,
      block,
      group,
      componentVersion,
      order: 1000,
      component
    })
    await em.persistAndFlush(item);


    const componentInstance = em.create(ComponentInstance, {
      name: 'demo',
      path: 'demo',
      component: component_table,
      componentVersion: component_table_version,
    });
    componentInstance.releaseList.add(release);
    await em.persistAndFlush(componentInstance);
  }
}