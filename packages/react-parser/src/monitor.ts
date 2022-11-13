import { DragAddComponentEventDataType, DragLineInfo, MarkerInfo, PostMessageType } from "@grootio/common";
import { getInstanceMetadata, getInstanceWrapperEle } from "./compiler";
import { controlMode } from "./util";

let monitorRunning = false;
let outlineSelectedInstanceId, outlineHoverInstanceId;
let draging;
let activeSlotEle: HTMLElement & {
  highlight?: () => void,
  cancelHighlight?: () => void,
};

export const launchWatch = () => {
  if (monitorRunning || !controlMode) {
    return () => { };
  }

  monitorRunning = true;
  document.body.addEventListener('mousemove', outlineHoverAction, true);
  document.body.addEventListener('mousedown', outlineMousedownAction, true);
  window.addEventListener('resize', updateActiveRect, true);
  document.addEventListener('scroll', updateActiveRect, true);

  return () => {
    document.body.removeEventListener('mousemove', outlineHoverAction, true);
    document.body.removeEventListener('mousedown', outlineMousedownAction, true);
    window.removeEventListener('resize', updateActiveRect, true);
    document.removeEventListener('scroll', updateActiveRect, true);
  }
}

export const resetWatch = (type?: 'hover' | 'selected') => {
  if (type === 'hover') {
    outlineHoverInstanceId = undefined;
  } else if (type === 'selected') {
    outlineSelectedInstanceId = undefined;
  } else {
    outlineHoverInstanceId = undefined;
    outlineSelectedInstanceId = undefined;
  }
}

export function outerSelected(instanceId: number) {
  const selectedEle = getInstanceWrapperEle(instanceId);
  if (!selectedEle) {
    return;
  }

  outlineSelectedInstanceId = instanceId;
  const metadata = getInstanceMetadata(outlineSelectedInstanceId);
  const clientRect = selectedEle.getBoundingClientRect();
  window.parent.postMessage({
    type: PostMessageType.InnerOutlineSelect,
    data: {
      clientRect,
      tagName: `${metadata.packageName}/${metadata.componentName}`,
      instanceId,
      parentInstanceId: metadata.parentId,
      rootInstanceId: metadata.rootId,
      propItemId: metadata.$$runtime.propItemId,
      abstractValueIdChain: metadata.$$runtime.abstractValueIdChain
    } as MarkerInfo
  }, '*');
}

export function updateActiveRect() {
  if (!outlineSelectedInstanceId && !outlineHoverInstanceId) {
    return;
  }

  let selectedInfo, hoverInfo;
  if (outlineSelectedInstanceId) {
    const selectedEle = getInstanceWrapperEle(outlineSelectedInstanceId);
    const selectedMetadata = getInstanceMetadata(outlineSelectedInstanceId);
    selectedInfo = {
      clientRect: selectedEle.getBoundingClientRect(),
      tagName: `${selectedMetadata.packageName}/${selectedMetadata.componentName}`,
      instanceId: outlineSelectedInstanceId
    }
  }

  if (outlineHoverInstanceId) {
    const hoverEle = getInstanceWrapperEle(outlineHoverInstanceId);
    const hoverMetadata = getInstanceMetadata(outlineHoverInstanceId);
    hoverInfo = {
      clientRect: hoverEle.getBoundingClientRect(),
      tagName: `${hoverMetadata.packageName}/${hoverMetadata.componentName}`,
      instanceId: outlineHoverInstanceId
    }
  }

  window.parent.postMessage({
    type: PostMessageType.InnerOutlineUpdate,
    data: {
      selected: selectedInfo,
      hover: hoverInfo
    }
  }, '*');
}

export function respondDragOver(positionX: number, positionY: number) {
  const slotEle = detectWrapperEle(positionX, positionY, 'grootSlot');
  if (slotEle !== activeSlotEle) {
    activeSlotEle?.cancelHighlight();
    activeSlotEle = slotEle;
  }

  if (!slotEle) {
    window.parent.postMessage({ type: PostMessageType.InnerDragLine }, '*');
    return;
  }

  if (activeSlotEle.dataset.grootAllowHighlight) {
    activeSlotEle.highlight();
    window.parent.postMessage({ type: PostMessageType.InnerDragLine }, '*');
  } else {
    const markerInfo = calcDragRect(positionX, positionY, slotEle);
    delete markerInfo.hitEle;
    window.parent.postMessage({ type: PostMessageType.InnerDragLine, data: markerInfo }, '*');
  }
}

export function respondDragEnter() {
  draging = true;
}

export function respondDragLeave() {
  activeSlotEle?.cancelHighlight();
  window.parent.postMessage({ type: PostMessageType.InnerDragLine }, '*');
  activeSlotEle = null;
  draging = false;
}

export function respondDragDrop(positionX: number, positionY: number, componentId: number) {
  if (!activeSlotEle) {
    return;
  }

  const parentInstanceId = +activeSlotEle.dataset.grootSlot;
  const keyChain = activeSlotEle.dataset.grootKeyChain;
  const parentMetadata = getInstanceMetadata(parentInstanceId);
  const propMetadata = parentMetadata.advancedProps.find(item => item.keyChain === keyChain);
  const propItemId = propMetadata.data.propItemId;
  const abstractValueIdChain = propMetadata.data.abstractValueIdChain;
  if (activeSlotEle.dataset.grootAllowHighlight) {
    window.parent.postMessage({
      type: PostMessageType.InnerDragHitSlot,
      data: {
        parentInstanceId,
        componentId,
        propItemId,
        abstractValueIdChain,
      } as DragAddComponentEventDataType
    }, '*');
  } else {
    const markerInfo = calcDragRect(positionX, positionY, activeSlotEle);
    const instanceEle = markerInfo.hitEle.children[0] as HTMLElement;
    const currentInstanceId = +instanceEle.dataset.grootComponentInstanceId;

    window.parent.postMessage({
      type: PostMessageType.InnerDragHitSlot,
      data: {
        parentInstanceId,
        componentId,
        propItemId,
        abstractValueIdChain,
        currentInstanceId,
        direction: { top: 'pre', bottom: 'next' }[markerInfo.direction]
      } as DragAddComponentEventDataType
    }, '*');
  }
  respondDragLeave();
}



function outlineHoverAction({ clientX, clientY }: MouseEvent) {
  if (draging) return;

  let hitEle = detectWrapperEle(clientX, clientY, 'grootComponentInstanceId');
  let instanceId, metadata;
  if (hitEle) {
    instanceId = +hitEle.dataset.grootComponentInstanceId;
    metadata = getInstanceMetadata(instanceId);
    if (!metadata.parentId) {
      // 根组件不需要选中操作
      hitEle = instanceId = metadata = null;
    }
  }

  if (hitEle) {
    outlineHoverInstanceId = instanceId;
    const clientRect = hitEle.getBoundingClientRect();
    window.parent.postMessage({
      type: PostMessageType.InnerOutlineHover,
      data: {
        clientRect,
        tagName: `${metadata.packageName}/${metadata.componentName}`
      }
    }, '*');
  } else {
    outlineHoverInstanceId = undefined;
    window.parent.postMessage({
      type: PostMessageType.InnerOutlineHover
    }, '*');
  }
}

function outlineMousedownAction() {
  // let hitEle = detectWrapperEle(clientX, clientY, 'grootComponentInstanceId');
  // let instanceId, metadata;
  // if (hitEle) {
  //   instanceId = +hitEle.dataset.grootComponentInstanceId;
  //   metadata = getInstanceMetadata(instanceId);
  //   if (!metadata.parentId) {
  //     // 根组件不需要选中操作
  //     hitEle = instanceId = metadata = null;
  //   }
  // }
  if (!outlineHoverInstanceId) {
    return;
  }

  outlineSelectedInstanceId = outlineHoverInstanceId;
  const hitEle = getInstanceWrapperEle(outlineSelectedInstanceId);
  const metadata = getInstanceMetadata(outlineSelectedInstanceId);
  const clientRect = hitEle.getBoundingClientRect();
  window.parent.postMessage({
    type: PostMessageType.InnerOutlineSelect,
    data: {
      clientRect,
      tagName: `${metadata.packageName}/${metadata.componentName}`,
      instanceId: outlineSelectedInstanceId,
      parentInstanceId: metadata.parentId,
      rootInstanceId: metadata.rootId,
      propItemId: metadata.$$runtime.propItemId,
      abstractValueIdChain: metadata.$$runtime.abstractValueIdChain
    } as MarkerInfo
  }, '*');
}

function detectWrapperEle(positionX: number, positionY: number, datasetKey: string, endParentElement?: HTMLElement) {
  let hitEle = document.elementFromPoint(positionX, positionY) as HTMLElement;

  while (hitEle) {
    if (hitEle === document.body || hitEle === document.documentElement || hitEle === endParentElement) {
      return null;
    } else if (hitEle.dataset[datasetKey]) {
      return hitEle;
    }
    hitEle = hitEle.parentElement;
  }

  return null;
}

function calcDragRect(positionX: number, positionY: number, slotEle: HTMLElement): DragLineInfo {
  let hitEle = detectWrapperEle(positionX, positionY, 'grootSlotItem', slotEle);
  if (!hitEle) {
    const children = slotEle.querySelectorAll('[data-groot-slot-item]');
    if (children.length) {
      hitEle = children.item(children.length - 1) as HTMLElement;
    } else {
      return null;
    }
  }

  const slotEleRect = slotEle.getBoundingClientRect();
  const hitEleRect = hitEle.getBoundingClientRect();
  const middleHeight = hitEleRect.top + (hitEleRect.height / 2);

  if (positionY > middleHeight) {
    return {
      direction: 'bottom',
      left: slotEleRect.left,
      width: slotEleRect.width,
      top: hitEleRect.bottom,
      hitEle
    };
  } else {
    return {
      direction: 'top',
      left: slotEleRect.left,
      width: slotEleRect.width,
      top: hitEleRect.top,
      hitEle
    };
  }
}
