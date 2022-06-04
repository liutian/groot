import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Component } from 'entities/Component';
import { ComponentInstance } from 'entities/ComponentInstance';
import { ComponentVersion } from 'entities/ComponentVersion';
import { Project } from 'entities/Project';
import { Release } from 'entities/Release';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioGroup } from 'entities/StudioGroup';
import { StudioItem } from 'entities/StudioItem';
import { omitProps } from 'util.ts/ormUtil';


@Injectable()
export class ComponentService {


  async getComponent(id: number, versionId?: number, releaseId?: number) {
    const em = RequestContext.getEntityManager();
    const component = await em.findOne(Component, id);
    let componentVersion;

    if (versionId) {
      componentVersion = await em.findOne(ComponentVersion, versionId);
    } else {

      let release;
      if (!releaseId) {
        const project = await em.findOne(Project, component.project.id, { populate: ['devRelease'] });
        release = project.devRelease;
      } else {
        release = await em.findAndCount(Release, releaseId);
      }
      component.release = wrap(release).toObject() as any;

      const instance = await em.findOne(ComponentInstance, {
        component,
        releaseList: [releaseId]
      }, { populate: ['componentVersion', 'valueList'] });
      component.instance = wrap(instance).toObject() as any;
      componentVersion = instance.componentVersion;
    }

    componentVersion.groupList = await em.find(StudioGroup, { componentVersion });
    componentVersion.blockList = await em.find(StudioBlock, { componentVersion });
    componentVersion.itemList = await em.find(StudioItem, { componentVersion }, { populate: ['optionList'] });

    component.version = wrap(componentVersion).toObject() as any;
    omitProps(component.version, [
      'groupList.componentVersion',
      'blockList.componentVersion',
      'itemList.componentVersion',
      'itemList.optionList.studioItem',
    ]);

    return component;
  }
}



