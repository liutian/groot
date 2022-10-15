import { ComponentValueType, PropBlockLayout, PropBlockStructType, PropItemType, PropValueType, WrapperType } from "@grootio/common";
import { EntityManager } from "@mikro-orm/core";

import { PropValue } from "../../entities/PropValue";
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
  const avatarComponent = em.create(Component, {
    name: '头像',
    packageName: 'antd',
    componentName: 'Avatar',
    wrapperType: WrapperType.InlineBlock,
    scaffold
  });
  await em.persistAndFlush(avatarComponent);

  // 创建组件版本
  const avatarComponentVersion = em.create(ComponentVersion, {
    name: 'v0.0.1',
    component: avatarComponent
  });
  avatarComponent.recentVersion = avatarComponentVersion;
  await em.persistAndFlush(avatarComponentVersion);

  // 创建组件配置项
  const avatarGroup = em.create(PropGroup, {
    name: '常用配置',
    order: 1000,
    componentVersion: avatarComponentVersion,
    component: avatarComponentVersion
  });
  await em.persistAndFlush(avatarGroup);

  const avatarBlock = em.create(PropBlock, {
    name: '基础功能',
    group: avatarGroup,
    componentVersion: avatarComponentVersion,
    order: 1000,
    component: avatarComponent,
    layout: PropBlockLayout.Horizontal,
    struct: PropBlockStructType.Default
  })
  await em.persistAndFlush(avatarBlock);

  const avatarItem1 = em.create(PropItem, {
    label: '资源地址',
    propKey: 'src',
    type: PropItemType.Text,
    defaultValue: '"https://joeschmoe.io/api/v1/random"',
    block: avatarBlock,
    group: avatarGroup,
    componentVersion: avatarComponentVersion,
    order: 1000,
    component: avatarComponent
  });

  const avatarItem2 = em.create(PropItem, {
    label: '形状',
    propKey: 'shape',
    type: PropItemType.Button_Group,
    defaultValue: '"circle"',
    valueOptions: '[{"label": "圆形","value": "circle"},{"label": "方形","value": "square"}]',
    block: avatarBlock,
    group: avatarGroup,
    componentVersion: avatarComponentVersion,
    order: 2000,
    component: avatarComponent
  })
  await em.persistAndFlush([avatarItem1, avatarItem2]);


  // 创建组件实例
  const avatarComponentInstance = em.create(ComponentInstance, {
    name: '个人资料',
    component: avatarComponent,
    componentVersion: avatarComponentVersion,
    wrapperType: WrapperType.InlineBlock,
    release,
    trackId: 0
  });
  await em.persistAndFlush(avatarComponentInstance);

  avatarComponentInstance.trackId = avatarComponentInstance.id;
  await em.persistAndFlush(avatarComponentInstance);







  // 创建组件
  const profileComponent = em.create(Component, {
    name: '个人资料',
    packageName: 'app',
    componentName: 'Profile',
    wrapperType: WrapperType.Block,
    scaffold
  });
  await em.persistAndFlush(profileComponent);

  // 创建组件版本
  const profileComponentVersion = em.create(ComponentVersion, {
    name: 'v0.0.1',
    component: profileComponent
  });
  profileComponent.recentVersion = profileComponentVersion;
  await em.persistAndFlush(profileComponentVersion);

  // 创建组件配置项
  const profileGroup = em.create(PropGroup, {
    name: '常用配置',
    order: 1000,
    componentVersion: profileComponentVersion,
    component: profileComponent
  });
  await em.persistAndFlush(profileGroup);

  const profileBlock = em.create(PropBlock, {
    name: '基础功能',
    group: profileGroup,
    componentVersion: profileComponentVersion,
    order: 1000,
    component: profileComponent,
    layout: PropBlockLayout.Horizontal,
    struct: PropBlockStructType.Default
  })
  await em.persistAndFlush(profileBlock);

  const profileItem1 = em.create(PropItem, {
    label: '姓名',
    propKey: 'name',
    type: PropItemType.Text,
    defaultValue: '"张三"',
    block: profileBlock,
    group: profileGroup,
    componentVersion: profileComponentVersion,
    order: 1000,
    component: profileComponent
  });

  const profileItem2 = em.create(PropItem, {
    label: '地址',
    propKey: 'address',
    type: PropItemType.Text,
    defaultValue: '"上海"',
    block: profileBlock,
    group: profileGroup,
    componentVersion: profileComponentVersion,
    order: 2000,
    component: profileComponent
  })

  const profileItem3 = em.create(PropItem, {
    label: '邮箱',
    propKey: 'email',
    type: PropItemType.Text,
    defaultValue: '"zhangsan@email.com"',
    block: profileBlock,
    group: profileGroup,
    componentVersion: profileComponentVersion,
    order: 3000,
    component: profileComponent
  })

  const profileItem4 = em.create(PropItem, {
    label: '头像',
    propKey: 'avatar',
    type: PropItemType.Component,
    block: profileBlock,
    group: profileGroup,
    componentVersion: profileComponentVersion,
    order: 4000,
    component: profileComponent
  })
  await em.persistAndFlush([profileItem1, profileItem2, profileItem3, profileItem4]);

  // 创建组件实例
  const profileComponentInstance = em.create(ComponentInstance, {
    name: '个人资料',
    path: '/profile',
    component: profileComponent,
    componentVersion: profileComponentVersion,
    wrapperType: WrapperType.Block,
    release,
    trackId: 0
  });
  await em.persistAndFlush(profileComponentInstance);

  profileComponentInstance.trackId = profileComponentInstance.id;
  await em.persistAndFlush(profileComponentInstance);

  avatarComponentInstance.parent = profileComponentInstance;
  avatarComponentInstance.root = profileComponentInstance;

  await em.persistAndFlush(avatarComponentInstance);

  const avatarValue = {
    setting: {},
    list: [{
      instanceId: avatarComponentInstance.id,
      componentId: avatarComponent.id,
      componentName: avatarComponent.name
    }]
  } as ComponentValueType;

  const profileItem4Value = em.create(PropValue, {
    propItem: profileItem4,
    component: profileComponent,
    componentVersion: profileComponentVersion,
    componentInstance: profileComponentInstance,
    type: PropValueType.Instance,
    value: JSON.stringify(avatarValue)
  });
  await em.persistAndFlush(profileItem4Value);
}