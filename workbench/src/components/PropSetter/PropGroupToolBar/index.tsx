import { DeleteOutlined, EditOutlined, SettingFilled, SettingOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import { useEffect, useState } from "react";

import PropHandleModel from "@model/PropHandleModel";
import PropPersistModel from "@model/PropPersistModel";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";

import styles from './index.module.less';
import { stringify } from "@util/utils";
import { PropGroup } from "@grootio/common";

const PropGroupToolBar: React.FC = () => {
  const [propPersistModel, propPersistAction] = useModel<PropPersistModel>(PropPersistModel);
  const [propHandleModel] = useModel(PropHandleModel);
  const [workbenchModel] = useModel(WorkbenchModel);

  const [group, setGroup] = useState<PropGroup>();

  useEffect(() => {
    const group = propHandleModel.getPropGroup(propHandleModel.activeGroupId);
    setGroup(group);
  }, [propHandleModel.activeGroupId, propPersistModel.settingModalSubmitting]);

  if (!group || !workbenchModel.prototypeMode) {
    return null;
  }

  return <div className={styles.container}>
    <Space >

      <Typography.Link onClick={() => {
        propPersistAction(() => {
          propPersistModel.currSettingPropGroup = JSON.parse(stringify(group));
        });
      }}>
        <EditOutlined />
      </Typography.Link>

      <Typography.Link disabled={propHandleModel.propTree.length === 1} onClick={() => {
        propPersistModel.delGroup(group.id);
      }}>
        <DeleteOutlined />
      </Typography.Link>
    </Space>
  </div>
}

export default PropGroupToolBar;