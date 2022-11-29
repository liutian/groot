import { DragLineInfo, PostMessageType } from "@grootio/common";
import WorkbenchModel from "@model/WorkbenchModel";
import { WorkbenchEvent } from "@util/common";
import { useModel } from "@util/robot";
import { useEffect, useRef, useState } from "react";
import styles from './index.module.less';

type PropType = {

}

const ViewportDrag: React.FC<PropType> = (prop) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const markerLineRef = useRef<HTMLDivElement>();
  const slotRef = useRef<HTMLDivElement>();
  const containerRef = useRef<HTMLDivElement>();

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
    containerRef.current.style.display = 'none';
    console.log(`IframeDrag drog finish`);
  }

  useEffect(() => {
    workbenchModel.addEventListener(PostMessageType.InnerDragLine, (event) => {
      const data = (event as any).detail as DragLineInfo;
      if (data) {
        let styles = markerLineRef.current.style;
        styles.display = 'inline-block';
        styles.left = `${data.left}px`;
        styles.top = `${data.top}px`;
        styles.width = `${data.width}px`;

        styles = slotRef.current.style;
        styles.display = 'inline-block';
        styles.top = `${data.slotRect.top}px`;
        styles.left = `${data.slotRect.left}px`;
        styles.width = `${data.slotRect.width}px`;
        styles.height = `${data.slotRect.height}px`;
      } else {
        markerLineRef.current.style.display = 'none';
        slotRef.current.style.display = 'none';
      }
    })

    workbenchModel.addEventListener(WorkbenchEvent.DragStart, () => {
      const rect = workbenchModel.getIframeRelativeRect();
      const styles = containerRef.current.style;
      styles.top = `${rect.top}px`;
      styles.left = `${rect.left}px`;
      styles.height = `${rect.height}px`;
      styles.width = `${rect.width}px`;
      styles.display = 'inline-block';
    })
  }, []);

  return <div className={styles.container} ref={containerRef} onDragOver={dragover} onDrop={drop} onDragEnter={dragenter} onDragLeave={dragleave} >
    <div ref={markerLineRef} className={styles.markerLine} />
    <div ref={slotRef} className={styles.slot}></div>
  </div>
}

export default ViewportDrag;