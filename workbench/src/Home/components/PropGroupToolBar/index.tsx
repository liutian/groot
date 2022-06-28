import { DeleteOutlined, EditOutlined, SettingFilled, SettingOutlined } from "@ant-design/icons";
import StudioModel from "@model/StudioModel";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { Space, Typography } from "antd";
import { useEffect, useState } from "react";

const PropGroupToolBar: React.FC = () => {
  const [model, updateAction] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');
  const [listStructGroup, setListStructGroup] = useState(false);
  const [group, setGroup] = useState<PropGroup>();

  useEffect(() => {
    const group = workbenchModel.getPropGroup(model.activeGroupId);
    setGroup(group);
    setListStructGroup(group.struct === 'List');
  }, [model.activeGroupId]);

  if (!model.workbench.stageMode || !group) {
    return null;
  }

  return <Space>
    {
      listStructGroup && (
        <Typography.Link onClick={() => model.toggleActiveGroupEditMode()}>
          {model.activeGroupEditMode ? <SettingFilled /> : <SettingOutlined />}
        </Typography.Link>
      )
    }
    <Typography.Link onClick={() => {
      model.delGroup(group.id);
    }}>
      <DeleteOutlined />
    </Typography.Link>

    <Typography.Link onClick={() => {
      updateAction(() => {
        model.currSettingPropGroup = JSON.parse(JSON.stringify(group));
      });
    }}>
      <EditOutlined />
    </Typography.Link>
  </Space>
}

export default PropGroupToolBar;