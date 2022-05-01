import { Button, Dropdown, Menu, Tabs } from "antd";
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

    const menus = (
      <Menu>
        <Menu.Item key="del" disabled={model.codeMetaStudio.propGroups.length === 0} onClick={() => model.delGroup(group.id)}>删除</Menu.Item>
        <Menu.Item key="copy">复制</Menu.Item>
        <Menu.Item key="setting" onClick={(e) => {
          e.domEvent.stopPropagation();
          updateAction(() => {
            model.currSettingStudioGroup = JSON.parse(JSON.stringify(group));
          });
        }}>配置</Menu.Item>
      </Menu>
    );

    return <Dropdown overlayStyle={{ minWidth: '5em' }} overlay={menus} trigger={['contextMenu']}>
      <div>{group.name}</div>
    </Dropdown>
  }

  // tab点击切换事件
  const tabOnChange = (activeKey: string) => {
    if (activeKey === '__add') {
      updateAction(() => {
        // 显示分组弹框
        model.currSettingStudioGroup = {
          id: 0,
          name: `分组${model.codeMetaStudio.propGroups.length + 1}`,
          propBlocks: [{
            id: 0,
            name: '配置块1',
            groupId: 0,
            propItems: [{
              id: 0,
              blockId: 0,
              groupId: 0,
              type: 'input',
              label: '配置项1',
              propKey: 'prop1',
              span: 24
            }],
          }]
        };
      })
      return;
    }

    // 选中某个分组
    model.switchActiveGroup(parseInt(activeKey));
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
    const list = model.codeMetaStudio.propGroups.map((group) => {
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