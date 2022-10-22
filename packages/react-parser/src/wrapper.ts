import { PostMessageType } from "@grootio/common";
import { controlMode } from "./util";

let monitorRunning = false;

export const startWrapperMonitor = () => {
  if (monitorRunning || !controlMode) {
    return () => { };
  }

  monitorRunning = true;
  document.body.addEventListener('mousemove', hoverAction, true);
  document.body.addEventListener('mousedown', mousedownAction, true);

  return () => {
    document.body.removeEventListener('mousemove', hoverAction, true);
    document.body.removeEventListener('mousedown', mousedownAction, true);
  }
}


function hoverAction({ pageX, pageY }: MouseEvent) {
  const hitEle = detectWrapperEle(pageX, pageY);
  if (hitEle) {
    const clientRect = hitEle.getBoundingClientRect();
    window.parent.postMessage({
      type: PostMessageType.WrapperHover,
      data: {
        clientRect,
        tagName: hitEle.dataset.grootWrapperTagName
      }
    }, '*');
  }
  else {
    window.parent.postMessage({
      type: PostMessageType.WrapperHover,
      data: null
    }, '*');
  }
}


function mousedownAction({ pageX, pageY }: MouseEvent) {
  const hitEle = detectWrapperEle(pageX, pageY);
  if (hitEle) {
    const clientRect = hitEle.getBoundingClientRect();
    window.parent.postMessage({
      type: PostMessageType.WrapperSelect,
      data: {
        clientRect,
        tagName: hitEle.dataset.grootWrapperTagName,
        instanceId: +hitEle.dataset.grootWrapper
      }
    }, '*');
  }
}

function detectWrapperEle(positionX: number, positionY: number) {
  let hitEle = document.elementFromPoint(positionX, positionY) as HTMLElement;

  while (hitEle) {
    if (hitEle === document.documentElement || hitEle === document.body) {
      return null;
    } else if (hitEle.dataset.grootWrapper || hitEle.dataset.grootComponentInstanceId) {
      return hitEle;
    }
    hitEle = hitEle.parentElement;
  }

  return hitEle;
}