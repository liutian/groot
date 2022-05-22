import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Component } from 'entities/Component';
import { ComponentVersion } from 'entities/ComponentVersion';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioGroup } from 'entities/StudioGroup';
import { StudioItem } from 'entities/StudioItem';
import { omitProps } from 'util.ts/ormUtil';


@Injectable()
export class AppService {

  async getComponent(id: number, versionId?: number) {
    const em = RequestContext.getEntityManager();
    const component = await em.findOne(Component, id);

    const componentVersion = await em.findOne(ComponentVersion, versionId || component.currentVersion.id);

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



