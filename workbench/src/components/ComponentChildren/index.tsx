import { PostMessageType, RuntimeComponentValueType } from "@grootio/common";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { Menu } from "antd";

const ComponentChildren: React.FC<{ value?: RuntimeComponentValueType }> = ({ value }) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const items = value?.list?.map((item) => {
    return {
      label: item.componentName,
      key: `${item.instanceId}`,
      onClick: () => workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterWrapperSelect, item.instanceId)
    }
  })

  return <Menu items={items}></Menu>
}

export default ComponentChildren;