import { DragLineInfo, PostMessageType } from "@grootio/common";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { useEffect, useRef } from "react";
import styles from './index.module.less';

type PropType = {

}

const IframeDrag: React.FC<PropType> = (prop) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const markerRef = useRef<HTMLDivElement>();

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
    console.log(`IframeDrag drog enter `);
  }

  const drageleave = () => {
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentLeave, {});
    console.log(`IframeDrag drog leave `);
  }

  const drop = (event) => {
    const componentId = event.dataTransfer.getData('componentId');
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentDrop, {
      positionX: event.pageX,
      positionY: event.pageY,
      componentId
    });
    console.log(`IframeDrag drog finish`);
  }

  useEffect(() => {
    workbenchModel.addEventListener(PostMessageType.InnerDragLine, (event) => {
      const data = (event as any).detail as DragLineInfo;
      if (data) {
        const styles = markerRef.current.style;
        styles.display = 'inline-block';
        styles.left = `${data.left}px`;
        styles.top = `${data.top}px`;
        styles.width = `${data.width}px`;
      } else {
        markerRef.current.style.display = 'none';
      }
    })
  }, []);

  return <div className={styles.container} onDragOver={dragover} onDrop={drop} onDragEnter={dragenter} onDragLeave={drageleave} >
    <div ref={markerRef} className={styles.marker} />
  </div>
}

export default IframeDrag;