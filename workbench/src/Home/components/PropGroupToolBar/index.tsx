import { DeleteOutlined, EditOutlined, SettingFilled, SettingOutlined } from "@ant-design/icons";
import StudioModel from "@model/StudioModel";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { Space, Typography } from "antd";
import { useEffect, useState } from "react";

import styles from './index.module.less';

const PropGroupToolBar: React.FC = () => {
  const [studioModel, updateAction] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');
  const [groupListStruct, setGroupListStruct] = useState(false);
  const [group, setGroup] = useState<PropGroup>();

  useEffect(() => {
    const group = workbenchModel.getPropGroup(studioModel.activeGroupId);
    setGroup(group);
    setGroupListStruct(group.struct === 'List');
  }, [studioModel.activeGroupId, studioModel.settingModalLoading]);

  if (!group || !workbenchModel.designMode) {
    return null;
  }

  return <div className={styles.container}>
    <Space >

      <Typography.Link onClick={() => {
        updateAction(() => {
          studioModel.currSettingPropGroup = JSON.parse(JSON.stringify(group));
        });
      }}>
        <EditOutlined />
      </Typography.Link>

      {
        groupListStruct && (
          <Typography.Link onClick={() => studioModel.toggleTemplateBlockDesignMode(group)}>
            {group.templateBlockDesignMode ? <SettingFilled /> : <SettingOutlined />}
          </Typography.Link>
        )
      }

      {
        workbenchModel.rootGroupList.length > 1 && (
          <Typography.Link onClick={() => {
            studioModel.delGroup(group.id);
          }}>
            <DeleteOutlined />
          </Typography.Link>
        )
      }
    </Space>
  </div>
}

export default PropGroupToolBar;