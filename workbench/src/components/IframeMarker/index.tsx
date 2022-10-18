import { DeleteOutlined, UpOutlined } from '@ant-design/icons';
import { useEffect, useRef } from 'react';
import { Space } from 'antd';

import WorkbenchModel from '@model/WorkbenchModel';
import { BreadcrumbChange, WorkbenchEvent } from '@util/common';
import { useModel } from '@util/robot';

import styles from './index.module.less';

const IframeMarker: React.FC = () => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const outlineRef = useRef<HTMLDivElement>();
  const tagNameRef = useRef<HTMLDivElement>();
  const toolbarRef = useRef<HTMLDivElement>();
  const cloneOutlineRef = useRef<HTMLDivElement>();
  const cloneToolbarRef = useRef<HTMLDivElement>();

  useEffect(() => {
    workbenchModel.addEventListener(WorkbenchEvent.CanvasHover, (event) => {
      const data = (event as CustomEvent).detail as { clientRect: DOMRect, tagName: string };
      if (data) {
        resetOutline(data.clientRect, data.tagName);
      } else {
        outlineRef.current.style.opacity = '0';
      }
    });

    workbenchModel.addEventListener(WorkbenchEvent.CanvasSelect, (event) => {
      const data = (event as CustomEvent).detail as { clientRect: DOMRect, tagName: string, instanceId: number };
      resetOutline(data.clientRect, data.tagName);
      resetToolbar(data.clientRect);

      cloneOutlineRef.current?.remove();
      cloneOutlineRef.current = outlineRef.current.cloneNode(true) as HTMLDivElement;
      outlineRef.current.insertAdjacentElement('beforebegin', cloneOutlineRef.current);

      cloneToolbarRef.current?.remove();
      cloneToolbarRef.current = toolbarRef.current.cloneNode(true) as HTMLDivElement;
      toolbarRef.current.insertAdjacentElement('beforebegin', cloneToolbarRef.current);

      workbenchModel.switchComponentInstance(data.instanceId, BreadcrumbChange.AppendRoot);
    });

    workbenchModel.addEventListener(WorkbenchEvent.CanvasMarkerReset, () => {
      outlineRef.current.style.opacity = '0';
      toolbarRef.current.style.opacity = '0';
      cloneOutlineRef.current?.remove();
      cloneToolbarRef.current?.remove();
    })

    outlineRef.current.parentElement.addEventListener('mouseleave', () => {
      outlineRef.current.style.opacity = '0';
      toolbarRef.current.style.opacity = '0';
    })

    function resetOutline(clientRect: DOMRect, tagName: string) {
      outlineRef.current.style.transform = `translate(${clientRect.x}px,${clientRect.y}px)`;
      outlineRef.current.style.width = `${clientRect.width}px`;
      outlineRef.current.style.height = `${clientRect.height}px`;
      outlineRef.current.style.opacity = '1';
      tagNameRef.current.innerText = tagName;
    }

    function resetToolbar(clientRect: DOMRect,) {
      const { width: tagNameWidth } = tagNameRef.current.getBoundingClientRect();
      toolbarRef.current.style.opacity = '1';
      const { width: toolbarWidth, height: toolbarHeight } = toolbarRef.current.getBoundingClientRect();
      let toolbarX = clientRect.x + clientRect.width - toolbarWidth;
      toolbarX = Math.max(clientRect.x + tagNameWidth + 5, toolbarX);
      toolbarRef.current.style.transform = `translate(${toolbarX}px,${clientRect.y - toolbarHeight}px)`;
    }
  }, [])

  return <>
    <div className={`${styles.positionBlock} ${styles.outline}`} ref={outlineRef}>
      <div className={`${styles.block} ${styles.tagName}`} ref={tagNameRef}></div>
    </div>

    <div className={`${styles.positionBlock} ${styles.block} ${styles.toolbar}`} ref={toolbarRef}>
      <Space size={4} >
        <div className={styles.toolItem}>
          <UpOutlined />
        </div>
        <div className={styles.toolItem}>
          <DeleteOutlined />
        </div>
      </Space>
    </div>
  </>
}


export default IframeMarker;