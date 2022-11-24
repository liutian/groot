import { Tabs, Typography } from "antd";
import { PlusOutlined } from '@ant-design/icons';

import { useModel } from '@util/robot';
import PropGroupPane from "../PropGroupPane";
import { autoIncrementForName } from "@util/utils";
import PropBlockPane from "../PropBlockPane";
import PropGroupToolBar from "../PropGroupToolBar";
import WorkbenchModel from "@model/WorkbenchModel";
import PropHandleModel from "@model/PropHandleModel";
import PropPersistModel from "@model/PropPersistModel";
import { PropGroup, PropGroupStructType } from "@grootio/common";

import styles from './index.module.less';

function PropPane() {
  const [propHandleModel] = useModel(PropHandleModel);
  const [propPersistModel, propPersistAction] = useModel(PropPersistModel);
  const [workbenchModel] = useModel(WorkbenchModel);

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
      const nameSuffix = autoIncrementForName(propHandleModel.propTree.map(g => g.name));
      // 显示分组弹框
      propPersistModel.currSettingPropGroup = {
        name: `配置组${nameSuffix}`,
      } as PropGroup;
    })
  }

  const createTabItems = () => {
    const list = propHandleModel.propTree.map((group) => {
      let content = <PropGroupPane group={group}
        key={`group-${group.id}-${propHandleModel.forceUpdateFormKey}`} />;
      if (group.struct === PropGroupStructType.Flat) {
        content = <PropBlockPane noWrapMode block={group.propBlockList[0]}
          key={`block-${group.propBlockList[0].id}-${propHandleModel.forceUpdateFormKey}`} />;
      }

      return { key: `${group.id}`, label: renderTabBarItem(group), className: styles.content, children: content };
    })

    if (workbenchModel.prototypeMode) {
      list.push({
        key: '__add',
        label: <Typography.Link><PlusOutlined /></Typography.Link>,
      } as any)
    }

    return list;
  }

  /////////////////////////////////////////////////////////////////////////////
  return <>
    <Tabs size="small" activeKey={propHandleModel.activeGroupId?.toString()}
      onChange={tabOnChange} tabBarExtraContent={<PropGroupToolBar />} items={createTabItems() as any} />
  </>
}


export default PropPane;