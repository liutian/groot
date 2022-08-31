import { AssetType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Asset } from 'entities/Asset';

@Injectable()
export class AssetService {

  async detail(type: AssetType, relativeId: number) {
    const em = RequestContext.getEntityManager();

    const asset = await em.findOne(Asset, {
      type,
      relativeId
    });

    if (!asset) {
      throw new LogicException(`not found asset`, LogicExceptionCode.NotFound);
    }

    return asset.content;
  }
}



