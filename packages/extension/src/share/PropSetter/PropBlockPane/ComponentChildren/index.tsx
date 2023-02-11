import { List } from "antd";
import { PostMessageType, RuntimeComponentValueType, useModel } from "@grootio/common";
import { grootHookManager } from "context";

const ComponentChildren: React.FC<{ value?: RuntimeComponentValueType }> = ({ value }) => {

  return <List size="small" bordered dataSource={value?.list || []}
    renderItem={item => (
      <List.Item onClick={() => {
        grootHookManager().callHook(PostMessageType.OuterComponentSelect, item.instanceId)
      }}>
        {item.componentName}
      </List.Item>
    )} />
}

export default ComponentChildren;