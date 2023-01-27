import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Application } from '../../entities/Application';
import { Release } from '../../entities/Release';
import { Organization } from '../../entities/Organization';
import { Project } from '../../entities/Project';
import { Plugin } from '../../entities/Plugin';

import { create as btnCreate } from './button';
import { create as profileCreate } from './profile';
import { create as proTableCreate } from './pro-table';
import { create as containerCreate } from './groot-container';
import { create as pageContainerCreate } from './groot-page-container';

export class DatabaseSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {

    // 创建项目
    const project = em.create(Project, {
      name: '后台系统'
    });
    await em.persistAndFlush(project);

    // 创建应用
    const application = em.create(Application, {
      key: 'demo',
      name: '管理端应用',
      playgroundPath: '/groot/playground',
      debugBaseUrl: 'http://groot-local.com:11000',
      project,
    });
    await em.persistAndFlush(application);

    // 创建迭代
    const release = em.create(Release, {
      name: 'v0.0.1',
      application
    });
    application.devRelease = release;
    application.qaRelease = release;
    application.plRelease = release;
    application.onlineRelease = release;
    await em.persistAndFlush(release);

    const plugin = em.create(Plugin, {
      name: 'groot-core',
      url: 'http://groot-local.com:12000/groot-core-plugin/index.js'
    });
    application.pluginList.add(plugin);
    await em.persistAndFlush(plugin);

    // 创建组织
    const org = em.create(Organization, {
      name: '管理平台',
      playgroundPath: '/groot/playground',
      debugBaseUrl: 'http://groot-local.com:11000'
    });
    await em.persistAndFlush(org);

    const plugin2 = em.create(Plugin, {
      name: 'groot-core',
      url: 'http://groot-local.com:12000/groot-core-plugin/index.js'
    });
    org.pluginList.add(plugin2);
    await em.persistAndFlush(org);

    await proTableCreate(em, org, release);

    await btnCreate(em, org, release);

    await profileCreate(em, org, release);

    await containerCreate(em, org);

    await pageContainerCreate(em, org);
  }
}