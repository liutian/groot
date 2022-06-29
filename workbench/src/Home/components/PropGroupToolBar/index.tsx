import { DeleteOutlined, EditOutlined, SettingFilled, SettingOutlined } from "@ant-design/icons";
import StudioModel from "@model/StudioModel";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { Space, Typography } from "antd";
import { useEffect, useState } from "react";

const PropGroupToolBar: React.FC = () => {
  const [studioModel, updateAction] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');
  const [listStructGroup, setListStructGroup] = useState(false);
  const [group, setGroup] = useState<PropGroup>();

  useEffect(() => {
    const group = workbenchModel.getPropGroup(studioModel.activeGroupId);
    setGroup(group);
    setListStructGroup(group.struct === 'List');
  }, [studioModel.activeGroupId]);

  if (!workbenchModel.stageMode || !group) {
    return null;
  }

  return <Space>
    {
      listStructGroup && (
        <Typography.Link onClick={() => studioModel.toggleActiveGroupEditMode()}>
          {studioModel.activeGroupEditMode ? <SettingFilled /> : <SettingOutlined />}
        </Typography.Link>
      )
    }
    <Typography.Link onClick={() => {
      studioModel.delGroup(group.id);
    }}>
      <DeleteOutlined />
    </Typography.Link>

    <Typography.Link onClick={() => {
      updateAction(() => {
        studioModel.currSettingPropGroup = JSON.parse(JSON.stringify(group));
      });
    }}>
      <EditOutlined />
    </Typography.Link>
  </Space>
}

export default PropGroupToolBar;