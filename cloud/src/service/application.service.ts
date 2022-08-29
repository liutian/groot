import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Application } from 'entities/Application';
import { Release } from 'entities/Release';


@Injectable()
export class ApplicationService {


  async getDetail(applicationId: number, releaseId?: number) {
    const em = RequestContext.getEntityManager();
    const application = await em.findOne(Application, applicationId);

    const release = await em.findOne(Release, releaseId || application.devRelease.id, {
      populate: ['instanceList'],
      populateWhere: { instanceList: { path: { $ne: null } } }
    });
    application.release = wrap(release).toObject() as any;

    application.releaseList = await em.find(Release, {
      application: applicationId
    });

    return application;
  }

}



