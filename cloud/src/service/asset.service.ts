import {
  ApplicationData, DeployStatusType, EnvType, Metadata,
  PropGroup as IPropGroup, PropBlock as IPropBlock, PropItem as IPropItem, PropValue as IPropValue, EnvTypeStr,
  ExtScriptModule, ExtensionRelationType, createExtensionHandler, ExtensionLevel, ExtensionInstance as IExtensionInstance
} from '@grootio/common';
import { EntityManager, RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { propTreeFactory, metadataFactory, propItemPipeline } from '@grootio/core';


import { LogicException } from 'config/logic.exception';
import { Application } from 'entities/Application';
import { ComponentInstance } from 'entities/ComponentInstance';
import { Release } from 'entities/Release';
import { Bundle } from 'entities/Bundle';
import { BundleAsset } from 'entities/BundleAsset';
import { DeployManifest } from 'entities/DeployManifest';
import { Deploy } from 'entities/Deploy';
import { PropValue } from 'entities/PropValue';
import { PropGroup } from 'entities/PropGroup';
import { PropBlock } from 'entities/PropBlock';
import { PropItem } from 'entities/PropItem';
import { NodeVM } from 'vm2';
import { ExtensionInstance } from 'entities/ExtensionInstance';
import { SolutionInstance } from 'entities/SolutionInstance';


const vm2 = new NodeVM()
@Injectable()
export class AssetService {

  async instanceDetail(assetId: number) {
    const em = RequestContext.getEntityManager();

    const asset = await em.findOne(BundleAsset, assetId, { populate: ['content'] });

    LogicException.assertNotFound(asset, 'InstanceAsset', assetId);

    return asset.content;
  }

  async appReleaseDetail(appKey: string, appEnv: EnvTypeStr) {
    const em = RequestContext.getEntityManager();

    const application = await em.findOne(Application, { key: appKey });

    LogicException.assertNotFound(application, 'Application', `key: ${appKey}`);

    const release = {
      [EnvTypeStr.Dev]: application.devRelease,
      [EnvTypeStr.Qa]: application.qaRelease,
      [EnvTypeStr.Pl]: application.plRelease,
      [EnvTypeStr.Ol]: application.onlineRelease
    }[appEnv];

    const manifest = await em.findOne(DeployManifest, { release }, { orderBy: { createdAt: 'DESC' }, populate: ['content'] });

    LogicException.assertNotFound(manifest, 'DeployManifest', `releaseId: ${release.id}`);

    return manifest.content;
  }

  async build(releaseId: number) {
    const em = RequestContext.getEntityManager();

    LogicException.assertParamEmpty(releaseId, 'releaseId');
    const release = await em.findOne(Release, releaseId);
    LogicException.assertNotFound(release, 'Release', releaseId);

    const application = await em.findOne(Application, release.application.id);

    const extHandler = createExtensionHandler();

    const releaseExtensionInstanceList = await em.find(ExtensionInstance, {
      relationId: releaseId,
      relationType: ExtensionRelationType.Release,
    }, { populate: ['extensionVersion'] })

    this.installPropItemPipelineModule(releaseExtensionInstanceList, ExtensionLevel.Application, extHandler)
    const releaseExtScriptModuleList = [...extHandler.application.values()].filter(item => !!item.propItemPipeline).map(item => item.propItemPipeline)

    const rootInstanceList = await em.find(ComponentInstance, { release, root: null });
    const instanceMetadataMap = new Map<ComponentInstance, Metadata[]>();
    // 生成metadata
    for (let rootInstance of rootInstanceList) {
      const metadataList = [];

      const solutionInstanceList = await em.find(SolutionInstance, {
        entry: rootInstance
      }, { orderBy: { primary: true } })

      for (const solutionInstance of solutionInstanceList) {
        const solutionExtensionInstanceList = await em.find(ExtensionInstance, {
          relationId: solutionInstance.solutionVersion.id,
          relationType: ExtensionRelationType.SolutionVersion
        }, { populate: ['extensionVersion'] })

        this.installPropItemPipelineModule(solutionExtensionInstanceList, ExtensionLevel.Solution, extHandler, solutionInstance.solutionVersion.id)
      }

      const entryExtensionInstanceList = await em.find(ExtensionInstance, {
        relationId: rootInstance.id,
        relationType: ExtensionRelationType.Entry
      }, { populate: ['extensionVersion'] })

      this.installPropItemPipelineModule(entryExtensionInstanceList, ExtensionLevel.Entry, extHandler)
      const entryExtScriptModuleList = [...extHandler.entry.values()].filter(item => !!item.propItemPipeline).map(item => item.propItemPipeline)

      const solutionExtScriptModuleList = [...(extHandler.solution.get(rootInstance.solutionInstance.solutionVersion.id)?.values() || [])].filter(item => !!item.propItemPipeline).map(item => item.propItemPipeline)
      const rootMetadata = await this.createMetadata(rootInstance, em, releaseExtScriptModuleList, solutionExtScriptModuleList, entryExtScriptModuleList);
      metadataList.push(rootMetadata);
      const childInstanceList = await em.find(ComponentInstance, { root: rootInstance }, { populate: ['component', 'componentVersion'] });

      for (let childInstance of childInstanceList) {
        const solutionExtScriptModuleList = [...(extHandler.solution.get(childInstance.solutionInstance.solutionVersion.id)?.values() || [])].filter(item => !!item.propItemPipeline).map(item => item.propItemPipeline)

        const childMetadata = await this.createMetadata(childInstance, em, releaseExtScriptModuleList, solutionExtScriptModuleList, entryExtScriptModuleList);
        metadataList.push(childMetadata);
      }

      instanceMetadataMap.set(rootInstance, metadataList);

      for (const extInstance of extHandler.entry.values()) {
        extHandler.uninstall(extInstance.id, ExtensionLevel.Entry)
      }

      for (const [solutionVersionId, map] of extHandler.solution) {
        for (const extInstance of map.values()) {
          extHandler.uninstall(extInstance.id, ExtensionLevel.Solution, solutionVersionId)
        }
      }
    }


    const bundle = await em.create(Bundle, {
      release,
      application,
    });

    await em.begin();
    try {
      // 创建bundle
      await em.flush();

      // 创建InstanceAsset
      const newAssetList = [];
      rootInstanceList.forEach((instance) => {
        const metadataList = instanceMetadataMap.get(instance);
        const asset = em.create(BundleAsset, {
          content: JSON.stringify(metadataList),
          entry: instance,
          bundle,
          key: instance.key
        });
        newAssetList.push(asset);
      });
      await em.flush();

      // 更新newAssetList
      bundle.newAssetList.add(newAssetList);
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
    const views = newAssetList.map((asset) => {
      return {
        key: asset.key,
        metadataUrl: `http://groot-local.com:10000/asset/instance/${asset.id}`
      }
    })

    const appData: ApplicationData = {
      name: bundle.application.name,
      key: bundle.application.key,
      views,
      envData: {}
    }

    const manifest = em.create(DeployManifest, {
      content: JSON.stringify(appData),
      release: bundle.release,
      bundle
    });

    await em.flush();

    em.create(Deploy, {
      release: bundle.release,
      application: bundle.application,
      manifest,
      env,
      status: DeployStatusType.Online,
      bundle
    });

    await em.flush();

    return manifest.id;
  }

  private async createMetadata(
    instance: ComponentInstance, em: EntityManager,
    releaseExtScriptModuleList: ExtScriptModule[],
    solutionExtScriptModuleList: ExtScriptModule[],
    entryExtScriptModuleList: ExtScriptModule[],
  ) {

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

    const metadata = metadataFactory(rootGroupList, {
      packageName: instance.component.packageName,
      componentName: instance.component.componentName,
      metadataId: instance.id,
      rootMetadataId: instance.rootId,
      parentMetadataId: instance.parentId,
    }, (params) => {
      propItemPipeline(entryExtScriptModuleList, solutionExtScriptModuleList, releaseExtScriptModuleList, params)
    });

    return metadata;
  }

  private installPropItemPipelineModule(
    extensionInstanceList: ExtensionInstance[],
    level: ExtensionLevel,
    extHandler: { install: (extInstance: IExtensionInstance, level: ExtensionLevel, solutionVersionId?: number) => boolean },
    solutionVersionId?: number
  ) {
    for (const extensionInstance of extensionInstanceList) {
      const extInstance = wrap(extensionInstance).toObject() as IExtensionInstance

      const success = extHandler.install(extInstance, level, solutionVersionId)
      if (success && extensionInstance.extensionVersion.propItemPipelineRaw.trim().length > 0) {
        const module = vm2.run(extInstance.extensionVersion.propItemPipelineRaw) as ExtScriptModule
        module.id = extInstance.id;
        extInstance.propItemPipeline = module
      }
    }
  }
}



