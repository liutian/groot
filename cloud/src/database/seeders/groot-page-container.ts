import { PropBlockLayout, PropBlockStructType, PropItemType } from "@grootio/common";
import { EntityManager } from "@mikro-orm/core";

import { Component } from "../../entities/Component";
import { ComponentVersion } from "../../entities/ComponentVersion";
import { PropBlock } from "../../entities/PropBlock";
import { PropGroup } from "../../entities/PropGroup";
import { PropItem } from "../../entities/PropItem";
import { Solution } from "../../entities/Solution";

export const create = async (em: EntityManager, solution: Solution) => {
  // 创建组件
  const pageComponent = em.create(Component, {
    name: '页面',
    packageName: 'groot',
    componentName: 'PageContainer',
    solution
  });
  await em.persistAndFlush(pageComponent);

  // 创建组件版本
  const pageComponentVersion = em.create(ComponentVersion, {
    name: 'v0.0.1',
    component: pageComponent
  });
  pageComponent.recentVersion = pageComponentVersion;
  await em.persistAndFlush(pageComponentVersion);

  // 创建组件配置项
  const pageGroup = em.create(PropGroup, {
    name: '常用配置',
    order: 1000,
    componentVersion: pageComponentVersion,
    component: pageComponent
  });
  await em.persistAndFlush(pageGroup);

  const pageBlock = em.create(PropBlock, {
    name: '基础功能',
    group: pageGroup,
    componentVersion: pageComponentVersion,
    order: 1000,
    component: pageComponent,
    layout: PropBlockLayout.Horizontal,
    struct: PropBlockStructType.Default
  })
  await em.persistAndFlush(pageBlock);

  const titleItem = em.create(PropItem, {
    label: '标题',
    propKey: 'title',
    type: PropItemType.Text,
    defaultValue: '"空白页"',
    block: pageBlock,
    group: pageGroup,
    componentVersion: pageComponentVersion,
    order: 1000,
    component: pageComponent
  });
  await em.persistAndFlush(titleItem);

  const contentItem = em.create(PropItem, {
    label: '内容',
    propKey: 'content',
    type: PropItemType.Component,
    block: pageBlock,
    group: pageGroup,
    componentVersion: pageComponentVersion,
    order: 2000,
    component: pageComponent
  });
  await em.persistAndFlush(contentItem);


}