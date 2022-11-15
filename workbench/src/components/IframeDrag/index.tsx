import { DragLineInfo, PostMessageType } from "@grootio/common";
import WorkbenchModel from "@model/WorkbenchModel";
import { WorkbenchEvent } from "@util/common";
import { useModel } from "@util/robot";
import { useEffect, useRef, useState } from "react";
import styles from './index.module.less';

type PropType = {

}

const IframeDrag: React.FC<PropType> = (prop) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const markerRef = useRef<HTMLDivElement>();
  const [currentStyles, setCurrentStyles] = useState({});

  // 必须有监听dragover事件否则drop事件无法触发
  const dragover = (event) => {
    event.preventDefault();
    const rect = workbenchModel.iframeEle.getBoundingClientRect();
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentOver, {
      positionX: event.pageX - rect.left,
      positionY: event.pageY - rect.top,
    });
  }

  const dragenter = () => {
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentEnter, {});
    console.log(`IframeDrag drog enter `);
  }

  const dragleave = () => {
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentLeave, {});
    console.log(`IframeDrag drog leave `);
  }

  const drop = (event) => {
    const componentId = event.dataTransfer.getData('componentId');
    const rect = workbenchModel.iframeEle.getBoundingClientRect();
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentDrop, {
      positionX: event.pageX - rect.left,
      positionY: event.pageY - rect.top,
      componentId
    });
    setCurrentStyles({});
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

    workbenchModel.addEventListener(WorkbenchEvent.DragStart, () => {
      const rect = workbenchModel.getIframeRelativeRect();
      setCurrentStyles({
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        height: `${rect.height}px`,
        width: `${rect.width}px`,
      })
    })
  }, []);

  return <div className={styles.container} style={currentStyles} onDragOver={dragover} onDrop={drop} onDragEnter={dragenter} onDragLeave={dragleave} >
    <div ref={markerRef} className={styles.marker} />
  </div>
}

export default IframeDrag;