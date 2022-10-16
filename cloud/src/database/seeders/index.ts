import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Application } from '../../entities/Application';
import { Release } from '../../entities/Release';
import { Organization } from '../../entities/Organization';
import { Project } from '../../entities/Project';

import { create as btnCreate } from './button';
import { create as profileCreate } from './profile';
import { create as proTableCreate } from './pro-table';
import { create as pageCreate } from './page';

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


    // 创建组织
    const org = em.create(Organization, {
      name: '管理平台',
      playgroundPath: '/admin/groot/playground'
    });
    await em.persistAndFlush(org);

    await proTableCreate(em, org, release);

    await btnCreate(em, org, release);

    await profileCreate(em, org, release);

    await pageCreate(em, org, release);
  }
}