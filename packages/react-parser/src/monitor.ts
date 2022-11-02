import { MarkerInfo, PostMessageType } from "@grootio/common";
import { getInstanceMetadata, getInstanceWrapperEle } from "./compiler";
import { controlMode } from "./util";

let monitorRunning = false;
let selectedInstanceId, hoverInstanceId;

export const launchWatch = () => {
  if (monitorRunning || !controlMode) {
    return () => { };
  }

  monitorRunning = true;
  document.body.addEventListener('mousemove', hoverAction, true);
  document.body.addEventListener('mousedown', mousedownAction, true);
  window.addEventListener('resize', updateActiveRect, true);
  document.addEventListener('scroll', updateActiveRect, true);

  return () => {
    document.body.removeEventListener('mousemove', hoverAction, true);
    document.body.removeEventListener('mousedown', mousedownAction, true);
    window.removeEventListener('resize', updateActiveRect, true);
    document.removeEventListener('scroll', updateActiveRect, true);
  }
}

export const resetWatch = () => {
  selectedInstanceId = undefined;
  hoverInstanceId = undefined;
}


function hoverAction({ clientX, clientY }: MouseEvent) {
  const hitEle = detectWrapperEle(clientX, clientY);
  if (hitEle) {
    hoverInstanceId = +hitEle.dataset.grootComponentInstanceId;
    const clientRect = hitEle.getBoundingClientRect();
    const metadata = getInstanceMetadata(hoverInstanceId);
    window.parent.postMessage({
      type: PostMessageType.InnerWrapperHover,
      data: {
        clientRect,
        tagName: `${metadata.packageName}/${metadata.componentName}`
      }
    }, '*');
  } else {
    hoverInstanceId = undefined;
    window.parent.postMessage({
      type: PostMessageType.InnerWrapperHover,
      data: null
    }, '*');
  }
}


function mousedownAction({ clientX, clientY }: MouseEvent) {
  const hitEle = detectWrapperEle(clientX, clientY);
  if (hitEle) {
    selectedInstanceId = +hitEle.dataset.grootComponentInstanceId;
    const metadata = getInstanceMetadata(selectedInstanceId);
    const clientRect = hitEle.getBoundingClientRect();
    window.parent.postMessage({
      type: PostMessageType.InnerWrapperSelect,
      data: {
        clientRect,
        tagName: `${metadata.packageName}/${metadata.componentName}`,
        instanceId: +hitEle.dataset.grootComponentInstanceId,
        parentInstanceId: metadata.parentId,
        rootInstanceId: metadata.rootId,
        propItemId: metadata.$$runtime.propItemId,
        abstractValueIdChain: metadata.$$runtime.abstractValueIdChain
      } as MarkerInfo
    }, '*');
  }
}

function detectWrapperEle(positionX: number, positionY: number) {
  let hitEle = document.elementFromPoint(positionX, positionY) as HTMLElement;

  while (hitEle) {
    if (hitEle === document.documentElement || hitEle === document.body) {
      return null;
    } else if (hitEle.dataset.grootComponentInstanceId) {
      const metadata = getInstanceMetadata(+hitEle.dataset.grootComponentInstanceId);
      if (metadata.parentId) {
        return hitEle;
      }
    }
    hitEle = hitEle.parentElement;
  }

  return null;
}

export function outerSelected(instanceId: number) {
  const selectedEle = getInstanceWrapperEle(instanceId);
  if (!selectedEle) {
    return;
  }

  selectedInstanceId = instanceId;
  const metadata = getInstanceMetadata(selectedInstanceId);
  const clientRect = selectedEle.getBoundingClientRect();
  window.parent.postMessage({
    type: PostMessageType.InnerWrapperSelect,
    data: {
      clientRect,
      tagName: `${metadata.packageName}/${metadata.componentName}`,
      instanceId: selectedInstanceId,
      parentInstanceId: metadata.parentId,
      rootInstanceId: metadata.rootId,
      propItemId: metadata.$$runtime.propItemId,
      abstractValueIdChain: metadata.$$runtime.abstractValueIdChain
    } as MarkerInfo
  }, '*');
}

export function updateActiveRect() {
  if (!selectedInstanceId) {
    return;
  }

  const selectedEle = getInstanceWrapperEle(selectedInstanceId);
  const metadata = getInstanceMetadata(selectedInstanceId);
  window.parent.postMessage({
    type: PostMessageType.InnerUpdateMarkerRect,
    data: {
      selected: selectedEle && {
        clientRect: selectedEle.getBoundingClientRect(),
        tagName: `${metadata.packageName}/${metadata.componentName}`,
        instanceId: selectedInstanceId
      }
    }
  }, '*');
}