import { List } from "antd";
import { PostMessageType, RuntimeComponentValueType, useModel } from "@grootio/common";

import WorkbenchModel from "@model/WorkbenchModel";

const ComponentChildren: React.FC<{ value?: RuntimeComponentValueType }> = ({ value }) => {
  const workbenchModel = useModel(WorkbenchModel);

  return <List size="small" bordered dataSource={value?.list || []}
    renderItem={item => (
      <List.Item onClick={() => workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterComponentSelect, item.instanceId)}>
        {item.componentName}
      </List.Item>
    )} />
}

export default ComponentChildren;