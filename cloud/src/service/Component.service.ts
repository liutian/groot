import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Component } from 'entities/Component';
import { ComponentInstance } from 'entities/ComponentInstance';
import { ComponentVersion } from 'entities/ComponentVersion';
import { Project } from 'entities/Project';
import { Release } from 'entities/Release';
import { PropBlock } from 'entities/PropBlock';
import { PropGroup } from 'entities/PropGroup';
import { PropItem } from 'entities/PropItem';
import { omitProps } from 'util.ts/ormUtil';


@Injectable()
export class ComponentService {


  async getComponent(id: number, versionId?: number, releaseId?: number) {
    const em = RequestContext.getEntityManager();
    const component = await em.findOne(Component, id);
    let componentVersion;

    if (versionId) {
      componentVersion = await em.findOne(ComponentVersion, versionId, { populate: ['groupList', 'blockList', 'itemList.optionList'] });
    } else {

      let release;
      if (!releaseId) {
        const project = await em.findOne(Project, component.project.id, { populate: ['devRelease'] });
        release = project.devRelease;
      } else {
        release = await em.findOne(Release, releaseId);
      }
      component.release = wrap(release).toObject() as any;

      const instance = await em.findOne(ComponentInstance, {
        component,
        releaseList: [releaseId]
      }, {
        populate: [
          'componentVersion.groupList',
          'componentVersion.blockList',
          'componentVersion.itemList.optionList',
          'propValueList'
        ]
      });
      component.instance = wrap(instance).toObject() as any;
      componentVersion = instance.componentVersion;
    }

    component.version = wrap(componentVersion).toObject() as any;
    omitProps(component, [
      'currentVersion',
      'instance.componentVersion',
      'version.groupList.componentVersion',
      'version.blockList.componentVersion',
      'version.itemList.componentVersion',
      'version.itemList.optionList.propItem',
    ]);

    return component;
  }
}



