import { RequestContext, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { ComponentStudio } from 'entities/ComponentStudio';
import { Page } from 'entities/Page';
import { StudioBlock } from 'entities/StudioBlock';
import { StudioGroup } from 'entities/StudioGroup';
import { StudioItem, StudioItemType } from 'entities/StudioItem';
import { pick } from 'util.ts/common';
import { omitProps } from 'util.ts/ormUtil';


@Injectable()
export class AppService {
  async getPage(id: number) {
    const em = RequestContext.getEntityManager();
    const page = await em.findOne(Page, id, {
      populate: [
        'component.studio',
        'component.codeMetaData',
      ],
    });

    const studio = page.component.studio;

    studio.allGroups = await em.find(StudioGroup, { componentStudio: studio.id });
    studio.allBlocks = await em.find(StudioBlock, { componentStudio: studio.id });
    studio.allItems = await em.find(StudioItem, { componentStudio: studio.id });

    omitProps(page, [
      'component.codeMetaData.component',
      'component.studio.allGroups.componentStudio',
      'component.studio.allBlocks.componentStudio',
      'component.studio.allItems.componentStudio',
    ]);

    return page;
  }

  async groupAdd(group: StudioGroup) {
    const em = RequestContext.getEntityManager();

    const componentStudio = await em.findOne(ComponentStudio, group.componentStudioId);
    const firstGroup = await em.findOne(StudioGroup, { isRoot: true, componentStudio: componentStudio }, { orderBy: { order: 'DESC' } });

    const newGroup = em.create(StudioGroup, {
      ...pick(group, ['name', 'propKey']),
      componentStudio,
      isRoot: true,
      order: (firstGroup ? firstGroup.order : 0) + 1000
    });

    const newBlock = em.create(StudioBlock, {
      name: '配置块',
      group: newGroup,
      componentStudio,
      order: 1000
    });
    newGroup.propBlocks.add(newBlock);

    const newItem = em.create(StudioItem, {
      label: '配置项',
      block: newBlock,
      group: newGroup,
      type: StudioItemType.INPUT,
      propKey: 'prop',
      value: '',
      componentStudio,
      order: 1000
    });
    newBlock.propItems.add(newItem);

    await em.flush();

    omitProps(newGroup, [
      'componentStudio',
      'propBlocks.componentStudio',
      'propBlocks.propItems.componentStudio'
    ]);

    return newGroup;
  }

  async groupRemove(groupId: number) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(StudioGroup, groupId, {
      populate: [
        'propBlocks.propItems'
      ]
    });

    if (!group) {
      return;
    }

    await em.begin();
    try {
      const blockList = group.propBlocks.getItems();
      for (let blockIndex = 0; blockIndex < blockList.length; blockIndex++) {
        const block = blockList[blockIndex];

        const itemList = block.propItems.getItems();
        for (let itemIndex = 0; itemIndex < itemList.length; itemIndex++) {
          const item = itemList[itemIndex];
          await em.removeAndFlush(item);
        }

        await em.removeAndFlush(block);
      }

      await em.removeAndFlush(group);

      await em.commit();
    } catch (e) {
      await em.rollback();
      throw e;
    }

  }

  async groupUpdate(rawGroup: StudioGroup) {
    const em = RequestContext.getEntityManager();

    const group = await em.findOne(StudioGroup, rawGroup.id);

    pick(rawGroup, ['name', 'propKey'], group);

    em.flush();
  }

  async movePosition(data: { originId: number, targetId: number, type: 'group' | 'block' | 'item' }) {
    const em = RequestContext.getEntityManager();
    if (data.type === 'group') {
      const originGroup = await em.findOne(StudioGroup, data.originId, { fields: ['order'] });
      const targetGroup = await em.findOne(StudioGroup, data.targetId, { fields: ['order'] });

      if (!originGroup || !targetGroup) {
        return;
      }

      const targetGroupPrev = await em.findOne(StudioGroup, { order: { $gt: targetGroup.order } }, { fields: ['order'] });

      if (!targetGroupPrev) {
        originGroup.order = targetGroup.order + 1000;
      } else {
        const newOrder = (targetGroup.order + targetGroupPrev.order) / 2;
        originGroup.order = newOrder;
      }

      await em.flush();
    }
  }
}



