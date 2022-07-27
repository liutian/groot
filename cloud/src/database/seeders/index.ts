import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ComponentVersion } from '../../entities/ComponentVersion';
import { Component } from '../../entities/Component';
import { PropItem } from '../../entities/PropItem';
import { PropBlock } from '../../entities/PropBlock';
import { PropGroup } from '../../entities/PropGroup';
import { Application } from '../../entities/Application';
import { Release } from '../../entities/Release';
import { ComponentInstance } from '../../entities/ComponentInstance';
import { PropValue } from '../../entities/PropValue';
import { Scaffold } from '../../entities/Scaffold';
import { PropItemType } from '@grootio/common';

export class DatabaseSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {

    const application = em.create(Application, {
      name: '管理系统',
      remoteFrontEndUrl: 'https://demo.com',
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

    const group_table = em.create(PropGroup, {
      name: '列配置',
      order: 1000,
      struct: 'List',
      propKey: 'columns',
      componentVersion: component_table_version,
      component: component_table,
    });
    await em.persistAndFlush(group_table);

    const block_table = em.create(PropBlock, {
      name: '列模版',
      group: group_table,
      componentVersion: component_table_version,
      order: 1000,
      component: component_table,
      isTemplate: true
    })
    await em.persistAndFlush(block_table);

    group_table.templateBlock = block_table;

    const item_table_1 = em.create(PropItem, {
      label: '索引',
      propKey: 'dataIndex',
      type: PropItemType.TEXT,
      block: block_table,
      group: group_table,
      componentVersion: component_table_version,
      order: 1000,
      span: 12,
      component: component_table
    })
    await em.persistAndFlush(item_table_1);

    const item_table_2 = em.create(PropItem, {
      label: '标题',
      propKey: 'title',
      type: PropItemType.TEXT,
      block: block_table,
      group: group_table,
      componentVersion: component_table_version,
      order: 1001,
      span: 12,
      component: component_table
    })
    await em.persistAndFlush(item_table_2);

    const item_table_3 = em.create(PropItem, {
      label: '类型',
      propKey: 'valueType',
      type: PropItemType.SELECT,
      block: block_table,
      group: group_table,
      componentVersion: component_table_version,
      order: 1002,
      component: component_table,
      valueOptions: '[{"label":"文本","value":"text"},{"label":"下拉框","value":"select"},{"label":"日期","value":"date"},{"label":"时间","value":"dateTime"}]'
    })
    await em.persistAndFlush(item_table_3);



    const item_table_4 = em.create(PropItem, {
      label: '提示信息',
      propKey: 'tooltip',
      type: PropItemType.TEXT,
      block: block_table,
      group: group_table,
      componentVersion: component_table_version,
      order: 1003,
      component: component_table,
    })
    await em.persistAndFlush(item_table_4);










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
      component
    })
    await em.persistAndFlush(block);

    const item = em.create(PropItem, {
      label: '配置项',
      propKey: 'children',
      type: PropItemType.TEXT,
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