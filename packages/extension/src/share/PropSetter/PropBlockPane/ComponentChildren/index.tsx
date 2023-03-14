import { List } from "antd";
import { PostMessageType, PropMetadataComponent } from "@grootio/common";
import { grootHookManager } from "context";

const ComponentChildren: React.FC<{ value?: PropMetadataComponent }> = ({ value }) => {

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