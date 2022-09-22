import { ApplicationData, DeployStatusType, EnvType, IComponent, IPropBlock, IPropGroup, IPropItem, IPropValue, Metadata, PropValueType } from '@grootio/common';
import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { propTreeFactory, metadataFactory } from '@grootio/core';

import { LogicException } from 'config/logic.exception';
import { Application } from 'entities/Application';
import { ComponentInstance } from 'entities/ComponentInstance';
import { Release } from 'entities/Release';
import { Bundle } from 'entities/Bundle';
import { InstanceAsset } from 'entities/InstanceAsset';
import { ReleaseAsset } from 'entities/ReleaseAsset';
import { Deploy } from 'entities/Deploy';
import { PropValue } from 'entities/PropValue';
import { PropGroup } from 'entities/PropGroup';
import { PropBlock } from 'entities/PropBlock';
import { PropItem } from 'entities/PropItem';

@Injectable()
export class AssetService {

  async instanceDetail(assetId: number) {
    const em = RequestContext.getEntityManager();

    const asset = await em.findOne(InstanceAsset, assetId);

    LogicException.assertNotFound(asset, 'InstanceAsset', assetId);

    return asset.content;
  }

  async appReleaseDetail(appKey: string, appEnv: EnvType) {
    const em = RequestContext.getEntityManager();

    const application = await em.findOne(Application, { key: appKey });

    LogicException.assertNotFound(application, 'Application', `key: ${appKey}`);

    const release = {
      [EnvType.Dev]: application.devRelease,
      [EnvType.Qa]: application.qaRelease,
      [EnvType.Pl]: application.plRelease,
      [EnvType.Ol]: application.onlineRelease
    }[appEnv];

    const asset = await em.findOne(ReleaseAsset, { release }, { orderBy: { createdAt: 'DESC' } });

    LogicException.assertNotFound(asset, 'ReleaseAsset', `releaseId: ${release.id}`);

    return asset.content;
  }

  async build(releaseId: number) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(releaseId, 'releaseId');
    const release = await em.findOne(Release, releaseId, {
      populateWhere: {
        instanceList: { path: { $ne: null } }
      }
    });
    LogicException.assertNotFound(release, 'Release', releaseId);

    const instanceList = await em.find(ComponentInstance, { release },
      { populate: ['component'] }
    );

    const instanceMetadataMap = new Map<ComponentInstance, Metadata>();

    for (let index = 0; index < instanceList.length; index++) {
      const instance = instanceList[index];

      const groupList = await em.find(PropGroup, { component: instance.component, componentVersion: instance.componentVersion });
      const blockList = await em.find(PropBlock, { component: instance.component, componentVersion: instance.componentVersion });
      const itemList = await em.find(PropItem, { component: instance.component, componentVersion: instance.componentVersion });
      const valueList = await em.find(PropValue, { componentInstance: instance });

      const rootGroupList = propTreeFactory(
        groupList.map(g => wrap(g).toObject()) as any as IPropGroup[],
        blockList.map(b => wrap(b).toObject()) as any as IPropBlock[],
        itemList.map(i => wrap(i).toObject()) as any as IPropItem[],
        valueList.map(v => wrap(v).toObject()) as any as IPropValue[]
      );

      const metadata = metadataFactory(rootGroupList, instance.component as IComponent, instance.id);
      instanceMetadataMap.set(instance, metadata);
    }

    const application = await em.findOne(Application, release.application.id, { populate: ['onlineRelease'] });

    const bundle = await em.create(Bundle, {
      release,
      application,
      appKey: application.key,
      appName: application.name
    });

    await em.begin();
    try {

      await em.flush();

      const newAssetList = [];
      instanceList.forEach((instance) => {
        const metadata = instanceMetadataMap.get(instance);
        const asset = em.create(InstanceAsset, {
          content: JSON.stringify([metadata]),
          componetInstace: instance,
          bundle,
          path: instance.path
        });
        newAssetList.push(asset);
      });

      await em.flush();

      bundle.newAssetList.add(...newAssetList);

      await em.flush();

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    return bundle.id;
  }

  async deploy(bundleId: number, env: EnvType) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(bundleId, 'bundleId');
    const bundle = await em.findOne(Bundle, bundleId, {
      populate: [
        'application.onlineRelease',
        'release',
        'newAssetList'
      ]
    });
    LogicException.assertNotFound(bundle, 'Bundle', bundleId);

    if (env === EnvType.Dev) {
      bundle.application.devRelease = bundle.release;
    } else if (env === EnvType.Qa) {
      bundle.application.qaRelease = bundle.release;
    } else if (env === EnvType.Pl) {
      bundle.application.plRelease = bundle.release;
    } else if (env === EnvType.Ol) {
      bundle.application.onlineRelease.archive = true;
      bundle.application.onlineRelease = bundle.release;
    }

    const newAssetList = bundle.newAssetList.getItems();
    const pathPrefix = bundle.application.pathPrefix || '';
    const pages = newAssetList.map((asset) => {
      return {
        path: pathPrefix + asset.path,
        metadataUrl: `http://127.0.0.1:3000/asset/instance/${asset.id}`
      }
    })

    const appData: ApplicationData = {
      name: bundle.appName,
      key: bundle.appKey,
      pages,
      envData: {}
    }

    const asset = em.create(ReleaseAsset, {
      content: JSON.stringify(appData),
      release: bundle.release,
      bundle
    });

    await em.flush();

    em.create(Deploy, {
      release: bundle.release,
      application: bundle.application,
      asset,
      env,
      status: DeployStatusType.Online,
      bundle
    });

    await em.flush();

    return asset.id;
  }
}



