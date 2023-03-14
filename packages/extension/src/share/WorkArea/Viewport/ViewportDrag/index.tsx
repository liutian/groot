import { ComponentDragAnchor, PostMessageType } from "@grootio/common";
import { useEffect, useRef } from "react";

import styles from './index.module.less';
import { grootHookManager } from "context";

const ViewportDrag: React.FC = () => {
  const dragAnchorRef = useRef<HTMLDivElement>();
  const dragSlotRef = useRef<HTMLDivElement>();
  const containerRef = useRef<HTMLDivElement>();
  const { registerHook } = grootHookManager()
  const { callHook } = grootHookManager()

  useEffect(() => {
    registerHook('gh.component.dragStart', () => {
      // 开始响应外部组件拖入操作
      containerRef.current.style.display = 'inline-block';
    })
    registerHook('gh.component.dragEnd', () => {
      containerRef.current.style.display = 'none';
    })
    registerHook(PostMessageType.InnerUpdateDragAnchor, setDragAnchor)
  }, []);

  function onDragEnter() {
    callHook(PostMessageType.OuterDragComponentEnter)
  }

  // 必须有监听dragover事件否则drop事件无法触发
  function onDragOver(event) {
    event.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    callHook(PostMessageType.OuterDragComponentOver, {
      positionX: event.pageX - rect.left,
      positionY: event.pageY - rect.top,
    })
  }

  function onDrop(event) {
    const componentId = event.dataTransfer.getData('componentId');
    const rect = containerRef.current.getBoundingClientRect();
    callHook(PostMessageType.OuterDragComponentDrop, {
      positionX: event.pageX - rect.left,
      positionY: event.pageY - rect.top,
      componentId
    })
    containerRef.current.style.display = 'none';
  }

  function onDragLeave() {
    callHook(PostMessageType.OuterDragComponentLeave)
  }

  function setDragAnchor(data: ComponentDragAnchor) {
    if (data) {
      let styles = dragAnchorRef.current.style;
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
      dragAnchorRef.current.style.display = 'none';
      dragSlotRef.current.style.display = 'none';
    }
  }

  return <div className={styles.container} ref={containerRef}
    onDragOver={onDragOver} onDrop={onDrop}
    onDragEnter={onDragEnter} onDragLeave={onDragLeave} >
    <div ref={dragAnchorRef} className={styles.dragAnchor} />
    <div ref={dragSlotRef} className={styles.dragSlot} />
  </div>
}

export default ViewportDrag;