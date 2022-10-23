import { PostMessageType } from "@grootio/common";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";

type PropType = {

}

const IframeDragMask: React.FC<PropType> = (prop) => {
  const [workbenchModel] = useModel(WorkbenchModel);

  // 必须有监听dragover事件否则drop事件无法触发
  const dragover = (event) => {
    event.preventDefault();
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentOver, {
      positionX: event.pageX,
      positionY: event.pageY,
    });
  }

  const dragenter = () => {
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentEnter, {});
    console.log(`iframeDragMask drog enter `);
  }

  const drageleave = () => {
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentLeave, {});
    console.log(`iframeDragMask drog leave `);
  }

  const drop = (event) => {
    const componentId = event.dataTransfer.getData('componentId');
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentDrop, {
      positionX: event.pageX,
      positionY: event.pageY,
      componentId: componentId
    });
    console.log(`iframeDragMask drog finish`);
  }

  return <div id={workbenchModel.iframeDragMaskId} onDragOver={dragover} onDrop={drop} onDragEnter={dragenter} onDragLeave={drageleave} />
}

export default IframeDragMask;