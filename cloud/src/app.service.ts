import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Page } from 'entities/Page';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioGroup } from 'entities/StudioGroup';
import { StudioItem } from 'entities/StudioItem';
import { BlockService } from 'service/block.service';
import { GroupService } from 'service/group.service';
import { omitProps } from 'util.ts/ormUtil';


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

    const studio = page.component.studio;

    studio.allGroups = await em.find(StudioGroup, { componentStudio: studio.id });
    studio.allBlocks = await em.find(StudioBlock, { componentStudio: studio.id });
    studio.allItems = await em.find(StudioItem, { componentStudio: studio.id });

    omitProps(page, [
      'component.codeMetaData.component',
      'component.studio.allGroups.componentStudio',
      'component.studio.allBlocks.componentStudio',
      'component.studio.allItems.componentStudio',
    ]);

    return page;
  }

}



