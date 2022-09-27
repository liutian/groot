import { PropBlockLayout, PropBlockStructType, PropItemType, PropValueType } from "@grootio/common";
import { EntityManager } from "@mikro-orm/core";

import { Component } from "../../entities/Component";
import { ComponentInstance } from "../../entities/ComponentInstance";
import { ComponentVersion } from "../../entities/ComponentVersion";
import { PropBlock } from "../../entities/PropBlock";
import { PropGroup } from "../../entities/PropGroup";
import { PropItem } from "../../entities/PropItem";
import { PropValue } from "../../entities/PropValue";
import { Release } from "../../entities/Release";
import { Scaffold } from "../../entities/Scaffold";

export const create = async (em: EntityManager, scaffold: Scaffold, release: Release) => {
  // 创建组件
  const searchComponent = em.create(Component, {
    name: '列表查询',
    packageName: '@ant-design/pro-table',
    componentName: 'ProTable',
    scaffold
  });
  await em.persistAndFlush(searchComponent);

  // 创建组件版本
  const searchComponentVersion = em.create(ComponentVersion, {
    name: 'v0.0.1',
    component: searchComponent
  });
  searchComponent.recentVersion = searchComponentVersion;
  await em.persistAndFlush(searchComponentVersion);

  // 创建组件配置项
  const searchGroup = em.create(PropGroup, {
    name: '常用配置',
    order: 1000,
    componentVersion: searchComponentVersion,
    component: searchComponent
  });
  await em.persistAndFlush(searchGroup);

  const searchBlock = em.create(PropBlock, {
    name: '列配置',
    propKey: 'columns',
    order: 1000,
    struct: PropBlockStructType.List,
    componentVersion: searchComponentVersion,
    component: searchComponent,
    group: searchGroup,
    layout: PropBlockLayout.Horizontal,
  });
  await em.persistAndFlush(searchBlock);

  const searchInnerItem = em.create(PropItem, {
    label: '子项模版配置',
    type: PropItemType.Hierarchy,
    block: searchBlock,
    group: searchGroup,
    componentVersion: searchComponentVersion,
    component: searchComponent,
    order: 1000
  })
  await em.persistAndFlush(searchInnerItem);

  const searchInnerGroup = em.create(PropGroup, {
    name: '内嵌分组',
    order: 1000,
    componentVersion: searchComponentVersion,
    component: searchComponent,
    root: false,
    parentItem: searchInnerItem
  });
  await em.persistAndFlush(searchInnerGroup);

  searchInnerItem.childGroup = searchInnerGroup;
  await em.persistAndFlush(searchInnerItem);

  const searchInnerBlock = em.create(PropBlock, {
    name: '通用列配置',
    order: 1000,
    struct: PropBlockStructType.Default,
    componentVersion: searchComponentVersion,
    component: searchComponent,
    group: searchInnerGroup,
    layout: PropBlockLayout.Horizontal,
  });
  await em.persistAndFlush(searchInnerBlock);


  const searchItem1 = em.create(PropItem, {
    label: '索引',
    propKey: 'dataIndex',
    type: PropItemType.Text,
    block: searchInnerBlock,
    group: searchInnerGroup,
    componentVersion: searchComponentVersion,
    component: searchComponent,
    order: 1000
  })
  await em.persistAndFlush(searchItem1);

  const searchItem2 = em.create(PropItem, {
    label: '标题',
    propKey: 'title',
    type: PropItemType.Text,
    block: searchInnerBlock,
    group: searchInnerGroup,
    componentVersion: searchComponentVersion,
    component: searchComponent,
    order: 2000
  })
  await em.persistAndFlush(searchItem2);

  const searchItem3 = em.create(PropItem, {
    label: '类型',
    propKey: 'valueType',
    type: PropItemType.Select,
    valueOptions: '[{"label": "文本","value": "text"},{"label": "日期","value": "date"},{"label": "下拉框","value": "select"}]',
    block: searchInnerBlock,
    group: searchInnerGroup,
    componentVersion: searchComponentVersion,
    component: searchComponent,
    order: 2000
  })
  await em.persistAndFlush(searchItem2);

  searchBlock.listStructData = `[${searchItem1.id},${searchItem2.id},${searchItem3.id}]`;
  await em.persistAndFlush(searchBlock);

  await createValue(em, searchInnerItem, searchComponent, searchComponentVersion, [searchItem1, searchItem2, searchItem3]);

  // 创建组件实例
  const tableComponentInstance = em.create(ComponentInstance, {
    name: '查询页',
    path: '/search',
    component: searchComponent,
    componentVersion: searchComponentVersion,
    release,
    trackId: 0
  });
  await em.persistAndFlush(tableComponentInstance);

  tableComponentInstance.trackId = tableComponentInstance.id;
  await em.persistAndFlush(tableComponentInstance);

  await createValue(em, searchInnerItem, searchComponent, searchComponentVersion, [searchItem1, searchItem2, searchItem3], tableComponentInstance);
}

async function createValue(em: EntityManager, searchInnerItem: PropItem,
  searchComponent: Component, searchComponentVersion: ComponentVersion,
  [searchItem1, searchItem2, searchItem3]: PropItem[], instance?: ComponentInstance) {

  const searchValue1 = em.create(PropValue, {
    propItem: searchInnerItem,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
  });

  const searchValue2 = em.create(PropValue, {
    propItem: searchInnerItem,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
  });

  const searchValue3 = em.create(PropValue, {
    propItem: searchInnerItem,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
  });
  await em.persistAndFlush([searchValue1, searchValue2, searchValue3]);

  const searchValue1Item1 = em.create(PropValue, {
    propItem: searchItem1,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    abstractValueIdChain: `${searchValue1.id}`,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
    value: '"id"'
  });

  const searchValue1Item2 = em.create(PropValue, {
    propItem: searchItem2,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    abstractValueIdChain: `${searchValue1.id}`,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
    value: '"ID"'
  });

  const searchValue1Item3 = em.create(PropValue, {
    propItem: searchItem3,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    abstractValueIdChain: `${searchValue1.id}`,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
    value: '"text"'
  });

  const searchValue2Item1 = em.create(PropValue, {
    propItem: searchItem1,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    abstractValueIdChain: `${searchValue2.id}`,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
    value: '"name"'
  });

  const searchValue2Item2 = em.create(PropValue, {
    propItem: searchItem2,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    abstractValueIdChain: `${searchValue2.id}`,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
    value: '"姓名"'
  });

  const searchValue2Item3 = em.create(PropValue, {
    propItem: searchItem3,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    abstractValueIdChain: `${searchValue2.id}`,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
    value: '"text"'
  });

  const searchValue3Item1 = em.create(PropValue, {
    propItem: searchItem1,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    abstractValueIdChain: `${searchValue3.id}`,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
    value: '"age"'
  });

  const searchValue3Item2 = em.create(PropValue, {
    propItem: searchItem2,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    abstractValueIdChain: `${searchValue3.id}`,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
    value: '"年龄"'
  });

  const searchValue3Item3 = em.create(PropValue, {
    propItem: searchItem3,
    component: searchComponent,
    componentVersion: searchComponentVersion,
    abstractValueIdChain: `${searchValue3.id}`,
    componentInstance: instance || undefined,
    type: instance ? PropValueType.Instance : PropValueType.Prototype,
    value: '"text"'
  });

  await em.persistAndFlush([
    searchValue1Item1, searchValue1Item2, searchValue1Item3,
    searchValue2Item1, searchValue2Item2, searchValue2Item3,
    searchValue3Item1, searchValue3Item2, searchValue3Item3]);
}