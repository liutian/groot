import { PostMessageType } from "@grootio/common";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { HTMLAttributes } from "react";

type PropType = {

} & HTMLAttributes<HTMLDivElement>;

const IframeDragMask: React.FC<PropType> = (prop) => {
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);

  // 必须有监听dragover事件否则drop事件无法触发
  const dragover = (event) => {
    event.preventDefault();
    workbenchModel.iframeManager.notifyIframe(PostMessageType.Drag_Component_Over, {
      positionX: event.pageX,
      positionY: event.pageY,
    });
  }

  const dragenter = () => {
    workbenchModel.iframeManager.notifyIframe(PostMessageType.Drag_Component_Enter, {});
    console.log(`iframeDragMask drog enter `);
  }

  const drageleave = () => {
    workbenchModel.iframeManager.notifyIframe(PostMessageType.Drag_Component_Leave, {});
    console.log(`iframeDragMask drog leave `);
  }

  const drop = (event) => {
    const component = event.dataTransfer.getData('groot');
    workbenchModel.iframeManager.notifyIframe(PostMessageType.Drag_Component_Drop, {
      positionX: event.pageX,
      positionY: event.pageY,
      component: JSON.parse(component)
    });
    console.log(`iframeDragMask drog finish`);
  }

  return <div {...prop} onDragOver={dragover} onDrop={drop} onDragEnter={dragenter} onDragLeave={drageleave} />
}

export default IframeDragMask;