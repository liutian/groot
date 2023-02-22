import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Application } from '../../entities/Application';
import { Release } from '../../entities/Release';
import { Organization } from '../../entities/Organization';
import { Project } from '../../entities/Project';
import { Extension } from '../../entities/Extension';

import { create as btnCreate } from './button';
import { create as profileCreate } from './profile';
import { create as proTableCreate } from './pro-table';
import { create as containerCreate } from './groot-container';
import { create as pageContainerCreate } from './groot-page-container';
import { Solution } from '../../entities/Solution';

export class DatabaseSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {
    // 创建组织
    const org = em.create(Organization, {
      name: '管理平台',
    });
    await em.persistAndFlush(org);

    const extension = em.create(Extension, {
      name: '@groot/core-extension',
      packageName: '_groot_core_extension',
      packageUrl: 'http://groot-local.com:12000/groot-core-extension/index.js',
      org
    });
    await em.persistAndFlush(extension);

    const solution = em.create(Solution, {
      name: '通用解决方案',
      playgroundPath: '/groot/playground',
      debugBaseUrl: 'http://groot-local.com:11000',
      org
    })
    await em.persistAndFlush(solution);

    solution.extensionList.add(extension);
    await em.persistAndFlush(extension);

    // 创建项目
    const project = em.create(Project, {
      name: '后台系统',
      org
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

    application.extensionList.add(extension);
    await em.persistAndFlush(extension);

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


    await proTableCreate(em, org, release);

    await btnCreate(em, org, release);

    await profileCreate(em, org, release);

    await containerCreate(em, org);

    await pageContainerCreate(em, org);
  }
}