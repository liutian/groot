import { Button, Dropdown, Menu, MenuProps, Tabs } from "antd";
import { EditFilled, EditOutlined, PlusOutlined, SettingFilled, SettingOutlined } from '@ant-design/icons';
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableTabNode from "../DraggableTabNode";
// import styles from './index.module.less';

import StudioModel from '@model/Studio';

import { useModel } from '@util/robot';
import StudioGroup from "../StudioGroup";
import StudioGroupSetting from "../StudioGroupSetting";
import StudioItemSetting from "../StudioItemSetting";
import StudioBlockSetting from "../StudioBlockSetting";
import ArrayObjectPanel from "../ArrayObjectPanel";
import { autoIncrementForName } from "@util/utils";

function Studio() {

  const [model, updateAction] = useModel<StudioModel>('studio');

  // 自定义渲染TabBar，实现拖拽功能
  const renderTabBar = (props: any, DefaultTabBar: React.ElementType) => (
    <DefaultTabBar {...props}>
      {(node: React.ReactElement) => (
        <DraggableTabNode key={node.key} nodeKey={node.key as string} moveNode={model.moveStudioGroup}>
          {node as any}
        </DraggableTabNode>
      )}
    </DefaultTabBar>
  );

  // 自定义渲染Tab标题，实现右键菜单功能
  const renderTabBarItem = (group: CodeMetaStudioGroup) => {

    const items: MenuProps['items'] = [
      {
        key: 'del',
        disabled: model.component!.version!.rootGroupList!.length === 0,
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
            model.currSettingStudioGroup = JSON.parse(JSON.stringify(group));
          });
        }
      }
    ];

    return <Dropdown overlayStyle={{ minWidth: '5em' }} overlay={<Menu items={items} />} trigger={['contextMenu']}>
      <div>{group.name}</div>
    </Dropdown>
  }

  // tab点击切换事件
  const tabOnChange = (activeKey: string) => {
    if (activeKey !== '__add') {
      // 选中某个分组
      model.switchActiveGroup(parseInt(activeKey));
      return;
    }

    updateAction(() => {
      const nameSuffix = autoIncrementForName(model.component!.version!.rootGroupList!.map(g => g.name));
      // 显示分组弹框
      model.currSettingStudioGroup = {
        id: 0,
        name: `分组${nameSuffix}`,
        isRoot: true,
        propBlockList: [],
        componentStudioId: model.component.id,
        order: 0
      };
    })
  }

  // tab右上角模式切换按钮
  const renderSettingSwitchBtn = () => {
    return <>
      <Button type="link" icon={model.manualMode ? <EditFilled /> : <EditOutlined />} onClick={() => {
        model.switchManualMode();
      }}>
      </Button>
      <Button type="link" icon={model.settingMode ? <SettingFilled /> : <SettingOutlined />} onClick={() => {
        model.switchSettingMode();
      }}>
      </Button>
    </>
  }

  const renderTabContent = () => {
    const list = model.component!.version!.rootGroupList!.map((group) => {
      return (<Tabs.TabPane key={group.id} tab={renderTabBarItem(group)} >
        <StudioGroup group={group} />
      </Tabs.TabPane>)
    })

    return <>
      {list}
      {model.settingMode ? <Tabs.TabPane key="__add" tab={<PlusOutlined />}></Tabs.TabPane> : null}
    </>
  }
  /////////////////////////////////////////////////////////////////////////////
  return <>
    <DndProvider backend={HTML5Backend}>
      <Tabs type="card" size="small" className="studio-tabs" tabBarExtraContent={renderSettingSwitchBtn()} activeKey={model.activeGroupId?.toString()}
        onChange={tabOnChange}
        renderTabBar={renderTabBar} >
        {renderTabContent()}
      </Tabs>
    </DndProvider>

    <StudioGroupSetting />
    <StudioBlockSetting />
    <StudioItemSetting />
    {
      model.handUpStudioItemStack.map(item => {
        return <ArrayObjectPanel key={item.id} item={item} />
      })
    }
  </>
}


export default Studio;