import { Tabs, Typography } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableTabNode from "../DraggableTabNode";

import { useModel } from '@util/robot';
import PropGroupPane from "../PropGroupPane";
import { autoIncrementForName } from "@util/utils";
import PropBlockPane from "../PropBlockPane";
import PropGroupToolBar from "../PropGroupToolBar";
import WorkbenchModel from "@model/WorkbenchModel";
import PropHandleModel from "@model/PropHandleModel";
import PropPersistModel from "@model/PropPersistModel";
import { PropGroupStructType } from "@grootio/common";

function PropPane() {
  const [propHandleModel] = useModel<PropHandleModel>(PropHandleModel.modelName);
  const [propPersistModel, propPersistAction] = useModel<PropPersistModel>(PropPersistModel.modelName);
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);

  // 自定义渲染TabBar，实现拖拽功能 todo 自己做一个
  const renderTabBar = (props: any, DefaultTabBar: React.ElementType) => (
    <DefaultTabBar {...props}>
      {(node: React.ReactElement) => (
        <DraggableTabNode key={node.key} style={{ marginRight: '15px' }} nodeKey={node.key as string} moveNode={propPersistModel.movePropGroup}>
          {node as any}
        </DraggableTabNode>
      )}
    </DefaultTabBar>
  );

  const renderTabBarItem = (group: PropGroup) => {
    return <div>{group.name}<i className="highlight" hidden={!group.highlight} /></div>;
  }

  // tab点击切换事件
  const tabOnChange = (activeKey: string) => {
    if (activeKey !== '__add') {
      // 选中某个分组
      propHandleModel.switchActiveGroup(parseInt(activeKey));
      return;
    }

    propPersistAction(() => {
      const nameSuffix = autoIncrementForName(propHandleModel.rootGroupList.map(g => g.name));
      // 显示分组弹框
      propPersistModel.currSettingPropGroup = {
        name: `分组${nameSuffix}`,
      } as PropGroup;
    })
  }

  const renderTabContent = () => {
    const list = propHandleModel.rootGroupList.map((group) => {
      let content = <PropGroupPane group={group} />;
      if (group.struct === PropGroupStructType.Flat) {
        content = <PropBlockPane noWrapMode block={group.propBlockList[0]} />;
      }

      return (<Tabs.TabPane key={group.id} tab={renderTabBarItem(group)} >
        {content}
      </Tabs.TabPane>)
    })

    return <>
      {list}
      {workbenchModel.prototypeMode && <Tabs.TabPane key="__add" tab={<Typography.Link><PlusOutlined /></Typography.Link>}></Tabs.TabPane>}
    </>
  }

  /////////////////////////////////////////////////////////////////////////////
  return <>
    <DndProvider backend={HTML5Backend}>
      <Tabs size="small" activeKey={propHandleModel.activeGroupId?.toString()}
        onChange={tabOnChange} renderTabBar={renderTabBar} tabBarExtraContent={<PropGroupToolBar />}>
        {renderTabContent()}
      </Tabs>
    </DndProvider>
  </>
}


export default PropPane;