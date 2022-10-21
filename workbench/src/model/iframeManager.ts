import { ApplicationData, IframeDebuggerConfig, iframeNamePrefix, PostMessageType } from "@grootio/common";
import { WorkbenchEvent } from "@util/common";


let iframe: HTMLIFrameElement;
let iframeReady = false;
let iframeDebuggerConfig: IframeDebuggerConfig = {

}
let applicationData: ApplicationData;
let playgroundPath: string;
let basePath: string;
let eventTrigger: EventTarget;

let pageNavCallback: () => void;


const instancePrototype = {
  notifyIframe,
  refresh
}

export type IframeManagerInstance = typeof instancePrototype;

export function launchIframeManager(ele: HTMLIFrameElement, _basePath: string, _playgroundPath: string, _applicationData: ApplicationData, _eventTrigger: EventTarget): IframeManagerInstance {
  iframe = ele;
  iframe.contentWindow.name = iframeNamePrefix;
  playgroundPath = _playgroundPath;
  basePath = _basePath;
  applicationData = _applicationData;
  eventTrigger = _eventTrigger;

  window.self.addEventListener('message', onMessage);

  // 方法在原型上避免执行视图更新操作
  return Object.create(instancePrototype);
}

function onMessage(event: MessageEvent) {
  // iframe页面准备就绪可以进行通信
  if (event.data === PostMessageType.Inner_Ready) {
    iframeReady = true;
    notifyIframe(PostMessageType.Outer_Set_Config);
  } else if (event.data === PostMessageType.Inner_Fetch_Application) {
    notifyIframe(PostMessageType.Outer_Set_Application);
  } else if (event.data.type === PostMessageType.Inner_Fetch_Page_Components) {
    if (event.data.data !== playgroundPath) {
      console.warn('current iframe path not control');
      return;
    }

    pageNavCallback();// 内部一般执行 Outer_Full_Update_Components
    pageNavCallback = null;
  } else if (event.data.type === PostMessageType.Drag_Hit_Slot) {
    const newEvent = new CustomEvent(WorkbenchEvent.AddComponent, { detail: event.data.data });
    eventTrigger.dispatchEvent(newEvent);
  } else if (event.data.type === PostMessageType.Wrapper_Hover) {
    const newEvent = new CustomEvent(WorkbenchEvent.CanvasHover, { detail: event.data.data });
    eventTrigger.dispatchEvent(newEvent);
  } else if (event.data.type === PostMessageType.Wrapper_Select) {
    const newEvent = new CustomEvent(WorkbenchEvent.CanvasSelect, { detail: event.data.data });
    eventTrigger.dispatchEvent(newEvent);
  }
}

function refresh(callback: () => void) {
  pageNavCallback = callback;
  const path = `${basePath}${playgroundPath}`;
  iframeDebuggerConfig.controlPage = playgroundPath;

  if (iframe.src === path) {
    notifyIframe(PostMessageType.Outer_Refresh_Page, path);
  } else {
    iframe.src = path;
  }
}

/**
 * 配置项变动通知iframe更新
 */
function notifyIframe(type: PostMessageType, data?: any) {
  if (!iframeReady) {
    console.warn('iframe not ready!!!');
    return;
  }

  if (type === PostMessageType.Outer_Set_Application) {
    iframe.contentWindow.postMessage({ type, data: data || applicationData }, '*');
  } else if (type === PostMessageType.Outer_Set_Config) {
    iframe.contentWindow.postMessage({ type, data: data || iframeDebuggerConfig }, '*');
  } else if (type === PostMessageType.Outer_Update_Component) {
    iframe.contentWindow.postMessage({
      type, data: {
        path: iframeDebuggerConfig.controlPage,
        data
      }
    }, '*');
  } else if (type === PostMessageType.Outer_Refresh_Page) {
    iframe.contentWindow.postMessage({ type, data }, '*');
    const event = new CustomEvent(WorkbenchEvent.CanvasMarkerReset);
    eventTrigger.dispatchEvent(event);
  } else {
    iframe.contentWindow.postMessage({ type, data }, '*');
  }

}
