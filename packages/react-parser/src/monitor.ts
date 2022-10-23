import { PostMessageType } from "@grootio/common";
import { getInstanceWrapperEle } from "./compiler";
import { controlMode } from "./util";

let monitorRunning = false;
let selectedInstanceId;
let hoverInstanceId;

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
    window.parent.postMessage({
      type: PostMessageType.InnerWrapperHover,
      data: {
        clientRect,
        tagName: hitEle.dataset.grootComponentName
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
    const clientRect = hitEle.getBoundingClientRect();
    window.parent.postMessage({
      type: PostMessageType.InnerWrapperSelect,
      data: {
        clientRect,
        tagName: hitEle.dataset.grootComponentName,
        instanceId: +hitEle.dataset.grootComponentInstanceId
      }
    }, '*');
  }
}

function detectWrapperEle(positionX: number, positionY: number) {
  let hitEle = document.elementFromPoint(positionX, positionY) as HTMLElement;

  while (hitEle) {
    if (hitEle === document.documentElement || hitEle === document.body) {
      return null;
    } else if (hitEle.dataset.grootComponentInstanceId) {
      return hitEle;
    }
    hitEle = hitEle.parentElement;
  }

  return null;
}


export function updateActiveRect() {
  if (!selectedInstanceId) {
    return;
  }

  const selectedEle = getInstanceWrapperEle(selectedInstanceId);
  window.parent.postMessage({
    type: PostMessageType.InnerUpdateMarkerRect,
    data: {
      selected: selectedEle && {
        clientRect: selectedEle.getBoundingClientRect(),
        tagName: selectedEle.dataset.grootComponentName,
        instanceId: +selectedEle.dataset.grootComponentInstanceId
      }
    }
  }, '*');
}