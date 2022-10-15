import { PropBlockLayout, PropBlockStructType, PropItemType, WrapperType } from "@grootio/common";
import { EntityManager } from "@mikro-orm/core";

import { Component } from "../../entities/Component";
import { ComponentInstance } from "../../entities/ComponentInstance";
import { ComponentVersion } from "../../entities/ComponentVersion";
import { PropBlock } from "../../entities/PropBlock";
import { PropGroup } from "../../entities/PropGroup";
import { PropItem } from "../../entities/PropItem";
import { Release } from "../../entities/Release";
import { Scaffold } from "../../entities/Scaffold";

export const create = async (em: EntityManager, scaffold: Scaffold, release: Release) => {
  // 创建组件
  const btnComponent = em.create(Component, {
    name: '按钮',
    packageName: 'antd',
    componentName: 'Button',
    wrapperType: WrapperType.InlineBlock,
    scaffold
  });
  await em.persistAndFlush(btnComponent);

  // 创建组件版本
  const btnComponentVersion = em.create(ComponentVersion, {
    name: 'v0.0.1',
    component: btnComponent
  });
  btnComponent.recentVersion = btnComponentVersion;
  await em.persistAndFlush(btnComponentVersion);

  // 创建组件配置项
  const btnGroup = em.create(PropGroup, {
    name: '常用配置',
    order: 1000,
    componentVersion: btnComponentVersion,
    component: btnComponent
  });
  await em.persistAndFlush(btnGroup);

  const btnBlock = em.create(PropBlock, {
    name: '基础功能',
    group: btnGroup,
    componentVersion: btnComponentVersion,
    order: 1000,
    component: btnComponent,
    layout: PropBlockLayout.Horizontal,
    struct: PropBlockStructType.Default
  })
  await em.persistAndFlush(btnBlock);

  const btnItem1 = em.create(PropItem, {
    label: '按钮文本',
    propKey: 'children',
    type: PropItemType.Text,
    defaultValue: '"hello"',
    block: btnBlock,
    group: btnGroup,
    componentVersion: btnComponentVersion,
    order: 1000,
    component: btnComponent
  });

  const btnItem2 = em.create(PropItem, {
    label: '按钮类型',
    propKey: 'type',
    type: PropItemType.Button_Group,
    defaultValue: '"primary"',
    valueOptions: '[{"label": "主要","value": "primary"},{"label": "默认","value": "default"},{"label": "幽灵","value": "dashed"},{"label": "链接","value": "link"}]',
    block: btnBlock,
    group: btnGroup,
    componentVersion: btnComponentVersion,
    order: 2000,
    component: btnComponent
  })

  const btnItem3 = em.create(PropItem, {
    label: '点击事件',
    propKey: 'onClick',
    type: PropItemType.Function,
    defaultValue: '$exportFn = () => alert($props.children)',
    block: btnBlock,
    group: btnGroup,
    componentVersion: btnComponentVersion,
    order: 3000,
    component: btnComponent
  })

  await em.persistAndFlush([btnItem1, btnItem2, btnItem3]);

  // 创建组件实例
  const btnComponentInstance = em.create(ComponentInstance, {
    name: '按钮',
    path: '/button',
    component: btnComponent,
    componentVersion: btnComponentVersion,
    wrapperType: WrapperType.InlineBlock,
    release,
    trackId: 0
  });
  await em.persistAndFlush(btnComponentInstance);

  btnComponentInstance.trackId = btnComponentInstance.id;
  await em.persistAndFlush(btnComponentInstance);
}