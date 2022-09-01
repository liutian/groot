import { AssetType, EnvType } from '@grootio/common';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Application } from 'entities/Application';
import { Asset } from 'entities/Asset';

@Injectable()
export class AssetService {

  async instanceDetail(instanceId: number) {
    const em = RequestContext.getEntityManager();

    const asset = await em.findOne(Asset, {
      type: AssetType.Instance,
      relativeId: instanceId
    });

    if (!asset) {
      throw new LogicException(`not found asset`, LogicExceptionCode.NotFound);
    }

    return asset.content;
  }

  async appReleaseDetail(appKey: string, appEnv: EnvType) {
    const em = RequestContext.getEntityManager();

    const application = await em.findOne(Application, { key: appKey });

    const release = {
      [EnvType.Dev]: application.devRelease,
      [EnvType.Qa]: application.qaRelease,
      [EnvType.Pl]: application.plRelease,
      [EnvType.Ol]: application.onlineRelease
    }[appEnv];

    const asset = await em.findOne(Asset, {
      type: AssetType.Release,
      relativeId: release.id
    });

    return asset.content;
  }
}



