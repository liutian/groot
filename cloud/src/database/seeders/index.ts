import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Application } from '../../entities/Application';
import { Release } from '../../entities/Release';
import { Scaffold } from '../../entities/Scaffold';
import { Project } from '../../entities/Project';

import { create as btnCreate } from './button';
import { create as profileCreate } from './profile';
import { create as proTableCreate } from './pro-table';

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
      playgroundPath: '/admin/groot/playground',
      project,
      pathPrefix: '/admin/groot'
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


    // 创建脚手架
    const scaffold = em.create(Scaffold, {
      name: '管理平台',
      playgroundPath: '/admin/groot/playground'
    });
    await em.persistAndFlush(scaffold);

    await proTableCreate(em, scaffold, release);

    await btnCreate(em, scaffold, release);

    await profileCreate(em, scaffold, release);
  }
}