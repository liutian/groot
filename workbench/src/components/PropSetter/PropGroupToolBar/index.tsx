import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { PropGroup, useModel } from "@grootio/common";

import PropHandleModel from "@model/PropHandleModel";
import PropPersistModel from "@model/PropPersistModel";
import WorkbenchModel from "@model/WorkbenchModel";
import { stringify } from "@util/utils";

import styles from './index.module.less';

const PropGroupToolBar: React.FC = () => {
  const propPersistModel = useModel<PropPersistModel>(PropPersistModel);
  const propHandleModel = useModel(PropHandleModel);
  const workbenchModel = useModel(WorkbenchModel);

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
        propPersistModel.currSettingPropGroup = JSON.parse(stringify(group));
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