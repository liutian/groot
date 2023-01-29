import { DragLineInfo, PostMessageType, useModel, WorkbenchEvent } from "@grootio/common";
import { useEffect, useRef } from "react";

import WorkbenchModel from "@model/WorkbenchModel";

import styles from './index.module.less';

const ViewportDrag: React.FC = () => {
  const workbenchModel = useModel(WorkbenchModel);
  const dragLineRef = useRef<HTMLDivElement>();
  const dragSlotRef = useRef<HTMLDivElement>();
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    workbenchModel.addEventListener(WorkbenchEvent.DragComponentStart, () => {
      containerRef.current.style.display = 'inline-block';
    });
    workbenchModel.addEventListener(WorkbenchEvent.DragComponentEnd, () => {
      containerRef.current.style.display = 'none';
    });

    workbenchModel.addEventListener(PostMessageType.InnerDragLine, dragLine)
  }, []);

  function onDragEnter() {
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentEnter, {});
  }

  // 必须有监听dragover事件否则drop事件无法触发
  function onDragOver(event) {
    event.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentOver, {
      positionX: event.pageX - rect.left,
      positionY: event.pageY - rect.top,
    });
  }

  function onDrop(event) {
    const componentId = event.dataTransfer.getData('componentId');
    const rect = containerRef.current.getBoundingClientRect();
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentDrop, {
      positionX: event.pageX - rect.left,
      positionY: event.pageY - rect.top,
      componentId
    });
    containerRef.current.style.display = 'none';
  }

  function onDragLeave() {
    workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterDragComponentLeave, {});
  }

  function dragLine(event) {
    const data = (event as any).detail as DragLineInfo;
    if (data) {
      let styles = dragLineRef.current.style;
      styles.display = 'inline-block';
      styles.left = `${data.left}px`;
      styles.top = `${data.top}px`;
      styles.width = `${data.width}px`;

      styles = dragSlotRef.current.style;
      styles.display = 'inline-block';
      styles.top = `${data.slotRect.top}px`;
      styles.left = `${data.slotRect.left}px`;
      styles.width = `${data.slotRect.width}px`;
      styles.height = `${data.slotRect.height}px`;
    } else {
      dragLineRef.current.style.display = 'none';
      dragSlotRef.current.style.display = 'none';
    }
  }

  return <div className={styles.container} ref={containerRef}
    onDragOver={onDragOver} onDrop={onDrop}
    onDragEnter={onDragEnter} onDragLeave={onDragLeave} >
    <div ref={dragLineRef} className={styles.dragLine} />
    <div ref={dragSlotRef} className={styles.dragSlot}></div>
  </div>
}

export default ViewportDrag;