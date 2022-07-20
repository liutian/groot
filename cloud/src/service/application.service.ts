import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Application } from 'entities/Application';


@Injectable()
export class ApplicationService {


  async getDetail(applicationId: number) {
    const em = RequestContext.getEntityManager();
    const application = await em.findOne(Application, applicationId);

    return application;
  }

}



