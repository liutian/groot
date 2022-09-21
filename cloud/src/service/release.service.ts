import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Release } from 'entities/Release';

import { pick } from 'util/common';
import { ComponentInstanceService } from './component-instance.service';
import { PropValueService } from './prop-value.service';
import { ComponentInstance } from 'entities/ComponentInstance';
import { PropValue } from 'entities/PropValue';


@Injectable()
export class ReleaseService {

  constructor(
    public componentInstanceService: ComponentInstanceService,
    public propValueService: PropValueService,
  ) { }

  async add(rawRelease: Release) {
    const em = RequestContext.getEntityManager();
    LogicException.assertParamEmpty(rawRelease.imageReleaseId, 'imageReleaseId');
    LogicException.assertParamEmpty(rawRelease.name, 'name');

    const imageRelease = await em.findOne(Release, rawRelease.imageReleaseId);
    LogicException.assertNotFound(imageRelease, 'Release', rawRelease.imageReleaseId);

    const count = await em.count(Release, { application: imageRelease.application, name: rawRelease.name });

    if (count > 0) {
      throw new LogicException(`release name conflict name:${rawRelease.name}`, LogicExceptionCode.NotUnique);
    }

    const originInstanceList = await em.find(ComponentInstance, { release: imageRelease });
    for (let index = 0; index < originInstanceList.length; index++) {
      const originInstance = originInstanceList[index];
      originInstance.valueList = await em.find(PropValue, { componentInstance: originInstance.id });
    }

    const instanceMap = new Map<number, ComponentInstance>();
    const valueMap = new Map<number, PropValue>();
    const newValueList = [];

    const release = em.create(Release, {
      name: rawRelease.name,
      application: imageRelease.application
    });

    await em.begin();
    try {
      await em.flush();


      originInstanceList.forEach((originInstance) => {
        const instance = em.create(ComponentInstance, {
          ...pick(originInstance, ['name', 'component', 'componentVersion', 'path', 'trackId']),
          release,
        });
        instanceMap.set(originInstance.id, instance);
      })

      await em.flush();

      originInstanceList.forEach((originInstance) => {
        const instance = instanceMap.get(originInstance.id);
        if (originInstance.parent) {
          instance.parent = instanceMap.get(originInstance.parent.id);
        }

        originInstance.valueList.forEach((originPropValue) => {
          const newPropValue = em.create(PropValue, {
            ...pick(originPropValue, [
              'propItem', 'value', 'abstractValueIdChain',
              'component', 'componentVersion', 'type',
              'order'
            ]),
            componentInstance: instance
          });
          valueMap.set(originPropValue.id, newPropValue);
          newValueList.push(newPropValue);
        })
      })

      await em.flush();

      newValueList.forEach((newPropValue) => {
        const abstractValueIdChain = (newPropValue.abstractValueIdChain?.split(',') || []).filter(id => !!id).map(valueId => {
          return valueMap.get(+valueId).id;
        }).join(',');

        newPropValue.abstractValueIdChain = abstractValueIdChain;
      });

      await em.flush();

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

    const newRelease = await em.findOne(Release, release.id);
    newRelease.instanceList = await em.find(ComponentInstance, { release: newRelease, path: { $ne: null } });

    return newRelease;
  }

  async detail(releaseId: number) {
    const em = RequestContext.getEntityManager();
    const release = await em.findOne(Release, releaseId);
    release.instanceList = await em.find(ComponentInstance, { release, path: { $ne: null } });

    return release;
  }

}



