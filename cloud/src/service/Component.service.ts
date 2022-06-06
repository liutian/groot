import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Component } from 'entities/Component';
import { ComponentInstance } from 'entities/ComponentInstance';
import { ComponentVersion } from 'entities/ComponentVersion';
import { Release } from 'entities/Release';
import { omitProps } from 'util.ts/ormUtil';


@Injectable()
export class ComponentService {

  async getComponentForRelease(id: number, releaseId?: number) {
    const em = RequestContext.getEntityManager();
    const component = await em.findOne(Component, id, {
      populate: ['project.devRelease', 'project.qaRelease', 'project.plRelease', 'project.onlineRelease']
    });

    let release;
    if (!releaseId) {
      release = component.project.devRelease;
    } else {
      release = await em.findOne(Release, releaseId);
    }
    component.release = wrap(release).toObject() as any;

    const instance = await em.findOne(ComponentInstance, {
      component,
      releaseList: [release.id]
    }, {
      populate: [
        'componentVersion.groupList',
        'componentVersion.blockList',
        'componentVersion.itemList.optionList',
        'propValueList'
      ]
    });
    component.instance = wrap(instance).toObject() as any;

    const componentVersion = instance.componentVersion;
    component.version = wrap(componentVersion).toObject() as any;

    const instanceList = await em.find(ComponentInstance, { component },
      { populate: ['releaseList'] }
    );
    const releaseSet = instanceList.reduce<Set<Release>>((pre, { releaseList }) => {
      releaseList.getItems().forEach((item) => {
        pre.add(wrap(item).toObject() as any);
      })
      return pre;
    }, new Set<Release>());
    component.releaseList = [...releaseSet];

    omitProps(component, [
      'recentVersion.groupList',
      'recentVersion.blockList',
      'recentVersion.itemList',
      'project.devRelease.project',
      'project.qaRelease.project',
      'project.plRelease.project',
      'project.onlineRelease.project',
      'release.project',
      'releaseList.project',

      'instance.componentVersion',
      'version.groupList.componentVersion',
      'version.blockList.componentVersion',
      'version.itemList.componentVersion',
      'version.itemList.optionList.propItem',
    ]);

    return component;
  }

  async getComponentForVersion(id: number, versionId?: number) {
    const em = RequestContext.getEntityManager();
    const component = await em.findOne(Component, id, { populate: ['versionList'] });

    const version = await em.findOne(ComponentVersion, versionId || component.recentVersion.id, { populate: ['groupList', 'blockList', 'itemList.optionList'] });
    component.version = wrap(version).toObject() as any;

    omitProps(component, [
      'versionList.groupList',
      'versionList.blockList',
      'versionList.itemList',
    ]);

    return component;
  }
}



