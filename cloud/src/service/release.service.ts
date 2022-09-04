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
    if (!rawRelease.name) {
      throw new LogicException('name can not empty', LogicExceptionCode.ParamEmpty);
    } else if (!rawRelease.imageReleaseId) {
      throw new LogicException('imageReleaseId can not empty', LogicExceptionCode.ParamEmpty);
    }

    const imageRelease = await em.findOne(Release, rawRelease.imageReleaseId, { populate: ['instanceList.valueList'] });
    if (!imageRelease) {
      throw new LogicException(`release not found id:${rawRelease.imageReleaseId}`, LogicExceptionCode.NotFound);
    }

    const count = await em.count(Release, { application: imageRelease.application, name: rawRelease.name });

    if (count > 0) {
      throw new LogicException(`release name conflict name:${rawRelease.name}`, LogicExceptionCode.NotUnique);
    }

    const originInstanceList = imageRelease.instanceList.getItems();

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
        if (originInstance.parentInstance) {
          instance.parentInstance = instanceMap.get(originInstance.parentInstance.id);
        }

        const originPropValueList = originInstance.valueList.getItems();

        originPropValueList.forEach((originPropValue) => {
          const newPropValue = em.create(PropValue, {
            ...pick(originPropValue, [
              'propItem', 'value', 'abstractValueIdChain',
              'component', 'componentVersion', 'application', 'project', 'scaffold', 'type',
              'order'
            ]),
            release,
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

    const newRelease = await em.findOne(Release, release.id, {
      populate: ['instanceList'],
      populateWhere: { instanceList: { path: { $ne: null } } }
    });

    return newRelease;
  }

  async detail(releaseId: number) {
    const em = RequestContext.getEntityManager();
    const release = await em.findOne(Release, releaseId, {
      populate: ['instanceList'],
      populateWhere: { instanceList: { path: { $ne: null } } }
    });

    return release;
  }

}



