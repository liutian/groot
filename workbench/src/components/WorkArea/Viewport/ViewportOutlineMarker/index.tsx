import { DeleteOutlined, UpOutlined } from '@ant-design/icons';
import { MarkerInfo, PostMessageType, useModel } from '@grootio/common';
import { useEffect, useRef } from 'react';

import PropHandleModel from '@model/PropHandleModel';
import WorkbenchModel from '@model/WorkbenchModel';

import styles from './index.module.less';

const ViewportOutlineMarker: React.FC = () => {
  const workbenchModel = useModel(WorkbenchModel);
  const propHandleModel = useModel(PropHandleModel);

  const hoverRef = useRef<HTMLDivElement>();
  const selectedRef = useRef<HTMLDivElement>();
  const hoverCacheRef = useRef<MarkerInfo>();
  const selectedCacheRef = useRef<MarkerInfo>();

  useEffect(() => {
    workbenchModel.addEventListener(PostMessageType.InnerOutlineHover, onHover);

    workbenchModel.addEventListener(PostMessageType.InnerOutlineSelect, onSelected);

    // iframe页面内部滚动或者窗口尺寸变化
    workbenchModel.addEventListener(PostMessageType.InnerOutlineUpdate, onUpdate);

    workbenchModel.addEventListener(PostMessageType.OuterRefreshView, () => {
      clear();
    })

    // 切换组件到根组件或者删除根组件下子组件需要清空边框
    workbenchModel.addEventListener(PostMessageType.OuterOutlineReset, (event: any) => {
      clear(event.detail);
    })

    hoverRef.current.parentElement.addEventListener('mouseleave', () => {
      workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterOutlineReset, 'hover');
    })

  }, [])

  function clear(type?: 'hover' | 'selected') {
    if (!type || type === 'hover') {
      hoverCacheRef.current = null;
      hoverRef.current.style.display = 'none';
    }

    if (!type || type === 'selected') {
      selectedCacheRef.current = null;
      selectedRef.current.style.display = 'none';
    }
  }

  function onHover(event) {
    const data = (event as CustomEvent).detail as MarkerInfo;

    if (data) {
      updateEle(hoverRef.current, data, true);
    } else {
      hoverRef.current.style.display = 'none';
    }

    hoverCacheRef.current = data;
  }

  function onSelected(event) {
    const data = (event as CustomEvent).detail as MarkerInfo;
    updateEle(selectedRef.current, data, true);
    selectedCacheRef.current = data;

    workbenchModel.switchComponentInstance(data.instanceId);
  }

  function onUpdate(event) {
    const { selected, hover } = (event as CustomEvent).detail as { selected: MarkerInfo, hover: MarkerInfo };

    if (hover) {
      updateEle(hoverRef.current, hover);
    } else {
      hoverRef.current.style.display = 'none';
    }
    hoverCacheRef.current = hover;

    if (selected) {
      updateEle(selectedRef.current, selected);
    } else {
      selectedRef.current.style.display = 'none';
    }
    selectedCacheRef.current = selected;
  }

  function updateEle(ele: HTMLElement, data: MarkerInfo, refreshToolbar = false) {
    ele.style.display = 'inline-block';
    ele.style.left = `${data.clientRect.x}px`;
    ele.style.top = `${data.clientRect.y}px`;
    ele.style.width = `${data.clientRect.width}px`;
    ele.style.height = `${data.clientRect.height}px`;

    if (data.clientRect.y <= 20 && data.clientRect.y >= -20) {
      ele.dataset.innerTop = 'true';
    } else {
      delete ele.dataset.innerTop;
    }

    if (refreshToolbar) {
      const tagNameEle = ele.querySelector(`.${styles.tagName}`) as HTMLElement;
      tagNameEle.innerText = data.tagName;
      const toolbarEle = ele.querySelector(`.${styles.toolbar}`) as HTMLElement;
      toolbarEle.style.left = '0px';

      const selectParentEle = toolbarEle.querySelector('.select-parent') as HTMLDivElement;
      if (data.parentInstanceId === data.rootInstanceId) {
        selectParentEle.style.display = 'none';
      } else {
        selectParentEle.style.display = 'inline-block';
      }

      const { width: tagNameWidth } = tagNameEle.getBoundingClientRect();
      const { width: toolbarWidth } = toolbarEle.getBoundingClientRect();
      let toolbarX = data.clientRect.width - toolbarWidth;
      toolbarX = Math.max(tagNameWidth + 5, toolbarX);
      toolbarEle.style.left = `${toolbarX}px`;
    }
  }

  function toolbarAction(type: 'hover' | 'selected', action: 'select-parent' | 'remove') {
    const ctx = type === 'hover' ? hoverCacheRef.current : selectedCacheRef.current;
    if (action === 'select-parent') {
      workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterComponentSelect, ctx.parentInstanceId);
    } else if (action === 'remove') {
      propHandleModel.removeChild(ctx.instanceId, ctx.propItemId, ctx.abstractValueIdChain);
    }
  }

  return <>
    <div className={styles.hover} ref={hoverRef} >
      <div className={styles.tagName} ></div>

      <div className={styles.toolbar} >
        <div className={`${styles.toolbarItem} select-parent`}
          onClick={() => toolbarAction('hover', 'select-parent')}>
          <UpOutlined />
        </div>

        <div className={styles.toolbarItem} onClick={() => toolbarAction('hover', 'remove')}>
          <DeleteOutlined />
        </div>
      </div>
    </div>

    <div className={styles.selected} ref={selectedRef} >
      <div className={styles.tagName} ></div>

      <div className={styles.toolbar} >
        <div className={`${styles.toolbarItem} select-parent`}
          onClick={() => toolbarAction('selected', 'select-parent')}>
          <UpOutlined />
        </div>

        <div className={styles.toolbarItem} onClick={() => toolbarAction('selected', 'remove')}>
          <DeleteOutlined />
        </div>
      </div>
    </div>
  </>
}


export default ViewportOutlineMarker;