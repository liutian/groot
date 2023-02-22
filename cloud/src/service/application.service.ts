import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException } from 'config/logic.exception';
import { Application } from 'entities/Application';
import { ComponentInstance } from 'entities/ComponentInstance';
import { Release } from 'entities/Release';


@Injectable()
export class ApplicationService {


  async getDetail(applicationId: number) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(applicationId, 'applicationId');
    const application = await em.findOne(Application, applicationId, { populate: ['extensionList'] });
    LogicException.assertNotFound(application, 'application', applicationId);

    return application;
  }

}



