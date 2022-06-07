import { Dropdown, Menu, MenuProps, Tabs, Typography } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableTabNode from "../DraggableTabNode";
// import styles from './index.module.less';

import StudioModel from '@model/StudioModel';

import { useModel } from '@util/robot';
import PropGroupStudio from "../PropGroupStudio";
import PropGroupSetting from "../PropGroupSetting";
import PropItemSetting from "../PropItemSetting";
import PropBlockSetting from "../PropBlockSetting";
import ArrayObjectPanel from "../ArrayObjectPanel";
import { autoIncrementForName } from "@util/utils";

function Studio() {

  const [model, updateAction] = useModel<StudioModel>('studio');

  // 自定义渲染TabBar，实现拖拽功能
  const renderTabBar = (props: any, DefaultTabBar: React.ElementType) => (
    <DefaultTabBar {...props}>
      {(node: React.ReactElement) => (
        <DraggableTabNode key={node.key} style={{ marginRight: '15px' }} nodeKey={node.key as string} moveNode={model.movePropGroup}>
          {node as any}
        </DraggableTabNode>
      )}
    </DefaultTabBar>
  );

  // 自定义渲染Tab标题，实现右键菜单功能
  const renderTabBarItem = (group: PropGroup) => {

    const items: MenuProps['items'] = [
      {
        key: 'del',
        disabled: model.component.version.rootGroupList!.length === 0,
        onClick: (e) => {
          e.domEvent.stopPropagation();
          model.delGroup(group.id);
        },
        label: '删除'
      }, {
        key: 'copy',
        label: '复制'
      }, {
        key: 'setting',
        label: '配置',
        onClick: (e) => {
          e.domEvent.stopPropagation();
          updateAction(() => {
            model.currSettingPropGroup = JSON.parse(JSON.stringify(group));
          });
        }
      }
    ];

    return model.editMode ? (<Dropdown overlayStyle={{ minWidth: '5em' }} overlay={<Menu items={items} />} trigger={['contextMenu']}>
      <div>{group.name}</div>
    </Dropdown>) : <div>{group.name}</div>
  }

  // tab点击切换事件
  const tabOnChange = (activeKey: string) => {
    if (activeKey !== '__add') {
      // 选中某个分组
      model.switchActiveGroup(parseInt(activeKey));
      return;
    }

    updateAction(() => {
      const nameSuffix = autoIncrementForName(model.component.version.rootGroupList!.map(g => g.name));
      // 显示分组弹框
      model.currSettingPropGroup = {
        id: 0,
        name: `分组${nameSuffix}`,
        root: true,
        propBlockList: [],
        order: 0
      };
    })
  }

  const renderTabContent = () => {
    const list = model.component.version.rootGroupList!.map((group) => {
      return (<Tabs.TabPane key={group.id} tab={renderTabBarItem(group)} >
        <PropGroupStudio group={group} />
      </Tabs.TabPane>)
    })

    return <>
      {list}
      {model.editMode ? <Tabs.TabPane key="__add" tab={<Typography.Link><PlusOutlined /></Typography.Link>}></Tabs.TabPane> : null}
    </>
  }
  /////////////////////////////////////////////////////////////////////////////
  return <>
    <DndProvider backend={HTML5Backend}>
      <Tabs size="small" className="studio-tabs" activeKey={model.activeGroupId?.toString()}
        onChange={tabOnChange}
        renderTabBar={renderTabBar} >
        {renderTabContent()}
      </Tabs>
    </DndProvider>

    <PropGroupSetting />
    <PropBlockSetting />
    <PropItemSetting />
    {
      model.handUpPropItemStack.map(item => {
        return <ArrayObjectPanel key={item.id} item={item} />
      })
    }
  </>
}


export default Studio;