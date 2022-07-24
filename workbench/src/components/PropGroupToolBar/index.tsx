import { DeleteOutlined, EditOutlined, SettingFilled, SettingOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import { useEffect, useState } from "react";

import PropHandleModel from "@model/PropHandleModel";
import PropPersistModel from "@model/PropPersistModel";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";

import styles from './index.module.less';

const PropGroupToolBar: React.FC = () => {
  const [propPersistModel, propPersistAction] = useModel<PropPersistModel>(PropPersistModel.modelName);
  const [propHandleModel] = useModel<PropHandleModel>(PropHandleModel.modelName);
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);

  const [groupListStruct, setGroupListStruct] = useState(false);
  const [group, setGroup] = useState<PropGroup>();

  useEffect(() => {
    const group = propHandleModel.getPropGroup(propHandleModel.activeGroupId);
    setGroup(group);
    setGroupListStruct(group.struct === 'List');
  }, [propHandleModel.activeGroupId, propPersistModel.settingModalLoading]);

  if (!group || !workbenchModel.prototypeMode) {
    return null;
  }

  return <div className={styles.container}>
    <Space >

      <Typography.Link onClick={() => {
        propPersistAction(() => {
          propPersistModel.currSettingPropGroup = JSON.parse(JSON.stringify(group));
        });
      }}>
        <EditOutlined />
      </Typography.Link>

      {
        groupListStruct && (
          <Typography.Link onClick={() => propHandleModel.toggleTemplateBlockDesignMode(group)}>
            {group.templateBlockDesignMode ? <SettingFilled /> : <SettingOutlined />}
          </Typography.Link>
        )
      }

      {
        propHandleModel.rootGroupList.length > 1 && (
          <Typography.Link onClick={() => {
            propPersistModel.delGroup(group.id);
          }}>
            <DeleteOutlined />
          </Typography.Link>
        )
      }
    </Space>
  </div>
}

export default PropGroupToolBar;