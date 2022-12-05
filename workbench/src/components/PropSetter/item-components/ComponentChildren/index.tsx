import { PostMessageType, RuntimeComponentValueType } from "@grootio/common";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { List } from "antd";

const ComponentChildren: React.FC<{ value?: RuntimeComponentValueType }> = ({ value }) => {
  const [workbenchModel] = useModel(WorkbenchModel);

  return <List size="small" bordered dataSource={value?.list || []}
    renderItem={item => (
      <List.Item onClick={() => workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterComponentSelect, item.instanceId)}>
        {item.componentName}
      </List.Item>
    )} />
}

export default ComponentChildren;