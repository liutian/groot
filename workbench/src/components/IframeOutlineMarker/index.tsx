import { DeleteOutlined, UpOutlined } from '@ant-design/icons';
import { useEffect, useRef } from 'react';
import { Space } from 'antd';

import WorkbenchModel from '@model/WorkbenchModel';
import { WorkbenchEvent } from '@util/common';
import { useModel } from '@util/robot';

import styles from './index.module.less';
import { MarkerInfo, PostMessageType } from '@grootio/common';
import PropHandleModel from '@model/PropHandleModel';

const IframeOutlineMarker: React.FC = () => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const [propHandleModel] = useModel(PropHandleModel);

  const outlineRef = useRef<HTMLDivElement>();
  const toolbarRef = useRef<HTMLDivElement>();
  const cloneOutlineRef = useRef<HTMLDivElement>();
  const markerInfoRef = useRef<MarkerInfo>({} as any);

  useEffect(() => {
    workbenchModel.addEventListener(PostMessageType.InnerOutlineHover, (event) => {
      const data = (event as CustomEvent).detail as MarkerInfo;
      if (data) {
        resetOutline(data.clientRect, data.tagName, outlineRef.current);
      } else {
        outlineRef.current.style.opacity = '0';
      }
    });

    workbenchModel.addEventListener(PostMessageType.InnerOutlineSelect, (event) => {
      const data = (event as CustomEvent).detail as MarkerInfo;
      resetOutline(data.clientRect, data.tagName, outlineRef.current);
      resetToolbar(data.clientRect, toolbarRef.current);

      cloneOutlineRef.current?.remove();
      cloneOutlineRef.current = outlineRef.current.cloneNode(true) as HTMLDivElement;
      outlineRef.current.insertAdjacentElement('beforebegin', cloneOutlineRef.current);

      workbenchModel.switchComponentInstance(data.instanceId);
      Object.assign(markerInfoRef.current, data);
    });

    workbenchModel.addEventListener(PostMessageType.InnerOutlineUpdate, (event) => {
      const { selected, hover } = (event as CustomEvent).detail as { selected: MarkerInfo, hover: MarkerInfo };

      if (selected) {
        resetOutline(selected.clientRect, selected.tagName, cloneOutlineRef.current);
        resetToolbar(selected.clientRect, toolbarRef.current);
      } else {
        cloneOutlineRef.current?.remove();
        toolbarRef.current.style.opacity = '0';
      }

      if (hover) {
        resetOutline(hover.clientRect, hover.tagName, outlineRef.current);
      } else {
        outlineRef.current.style.opacity = '0';
      }

    })


    workbenchModel.addEventListener(WorkbenchEvent.CanvasMarkerReset, () => {
      outlineRef.current.style.opacity = '0';
      toolbarRef.current.style.opacity = '0';
      cloneOutlineRef.current?.remove();
    })

    outlineRef.current.parentElement.addEventListener('mouseleave', () => {
      outlineRef.current.style.opacity = '0';
      workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterOutlineReset, 'hover');
    })

    function resetOutline(clientRect: DOMRect, tagName: string, ele: HTMLElement) {
      ele.style.transform = `translate(${clientRect.x}px,${clientRect.y}px)`;
      ele.style.width = `${clientRect.width}px`;
      ele.style.height = `${clientRect.height}px`;
      ele.style.opacity = '1';
      const tagNameEle = ele.querySelector('.iframe-marker-outline-tag-name') as HTMLElement;
      tagNameEle.innerText = tagName;
    }

    function resetToolbar(clientRect: DOMRect, ele: HTMLElement) {
      const tagNameEle = outlineRef.current.querySelector('.iframe-marker-outline-tag-name') as HTMLElement;
      const { width: tagNameWidth } = tagNameEle.getBoundingClientRect();
      ele.style.opacity = '1';
      const { width: toolbarWidth, height: toolbarHeight } = ele.getBoundingClientRect();
      let toolbarX = clientRect.x + clientRect.width - toolbarWidth;
      toolbarX = Math.max(clientRect.x + tagNameWidth + 5, toolbarX);
      ele.style.transform = `translate(${toolbarX}px,${clientRect.y - toolbarHeight}px)`;
    }
  }, [])

  return <>
    <div className={`${styles.outline}`} ref={outlineRef}>
      <div className={`${styles.tagName} iframe-marker-outline-tag-name`} ></div>
    </div>

    <div className={`${styles.toolbar}`} ref={toolbarRef}>
      <Space size={4} >
        {
          markerInfoRef.current.parentInstanceId !== markerInfoRef.current.rootInstanceId && (
            <div onClick={() => {
              workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterWrapperSelect, markerInfoRef.current.parentInstanceId);
            }}>
              <UpOutlined />
            </div>
          )
        }

        <div onClick={() => {
          propHandleModel.removeChild(markerInfoRef.current.instanceId, markerInfoRef.current.propItemId, markerInfoRef.current.abstractValueIdChain)
        }}>
          <DeleteOutlined />
        </div>
      </Space>
    </div>
  </>
}


export default IframeOutlineMarker;