import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Page } from 'entities/Page';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioGroup } from 'entities/StudioGroup';
import { StudioItem } from 'entities/StudioItem';


@Injectable()
export class AppService {
  async getPage(id: number) {
    const em = RequestContext.getEntityManager();
    const page = await em.findOne(Page, id, {
      populate: [
        'component.studio',
        'component.codeMetaData',
      ],
    });
    return page;
  }
}
