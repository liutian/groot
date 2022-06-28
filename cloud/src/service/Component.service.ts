import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { LogicException, LogicExceptionCode } from 'config/logic.exception';
import { Component } from 'entities/Component';
import { ComponentInstance } from 'entities/ComponentInstance';
import { ComponentVersion } from 'entities/ComponentVersion';
import { Release } from 'entities/Release';


@Injectable()
export class ComponentService {

  async getComponentForRelease(id: number, releaseId?: number) {
    const em = RequestContext.getEntityManager();
    const component = await em.findOne(Component, id, {
      populate: ['project.devRelease', 'project.qaRelease', 'project.plRelease', 'project.onlineRelease']
    });

    if (!component) {
      throw new LogicException(`not found component id:${id}`, LogicExceptionCode.NotFound);
    }

    let release;
    if (!releaseId) {
      release = component.project.devRelease;
    } else {
      release = await em.findOne(Release, releaseId);

      if (!release) {
        throw new LogicException(`not found release id:${releaseId}`, LogicExceptionCode.NotFound);
      }
    }
    component.release = wrap(release).toObject() as any;

    const instance = await em.findOne(ComponentInstance, {
      component,
      releaseList: [release.id]
    }, {
      populate: [
        'propValueList'
      ]
    });

    if (!instance) {
      throw new LogicException('not found instance', LogicExceptionCode.NotFound);
    }

    component.instance = wrap(instance).toObject() as any;

    const version = await em.findOne(ComponentVersion, instance.componentVersion,
      { populate: ['groupList', 'blockList', 'itemList.optionList'] }
    );
    component.version = wrap(version).toObject() as any;

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

    return component;
  }

  async getComponentForVersion(id: number, versionId?: number) {
    const em = RequestContext.getEntityManager();
    const component = await em.findOne(Component, id, { populate: ['versionList'] });

    if (!component) {
      throw new LogicException(`not found component id: ${id}`, LogicExceptionCode.NotFound);
    }

    if (!versionId && component.recentVersion?.id) {
      throw new LogicException('not found component version id', LogicExceptionCode.NotFound);
    }

    const version = await em.findOne(ComponentVersion, versionId || component.recentVersion?.id,
      { populate: ['groupList', 'blockList', 'itemList.optionList'] }
    );

    if (!version) {
      throw new LogicException('not found component version ', LogicExceptionCode.NotFound);
    }

    component.version = wrap(version).toObject() as any;

    return component;
  }
}



