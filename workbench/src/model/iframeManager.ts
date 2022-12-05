import { ApplicationData, IframeControlType, IframeDebuggerConfig, iframeNamePrefix, PostMessageType } from "@grootio/common";
import { WorkbenchEvent } from "@util/common";


export let iframeDebuggerConfig: IframeDebuggerConfig = {
  runtimeConfig: {

  }
}

let iframe: HTMLIFrameElement;
let iframeReady = false;
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

export function launchIframeManager(ele: HTMLIFrameElement, _basePath: string, _playgroundPath: string, _applicationData: ApplicationData, _eventTrigger: EventTarget, controlType: IframeControlType): IframeManagerInstance {
  iframe = ele;
  iframe.contentWindow.name = `${iframeNamePrefix}${controlType}`;
  playgroundPath = _playgroundPath;
  basePath = _basePath;
  applicationData = _applicationData;
  eventTrigger = _eventTrigger;

  window.self.addEventListener('message', onMessage);

  // 方法在原型上避免执行视图更新操作
  return Object.create(instancePrototype);
}

function onMessage(event: MessageEvent) {
  if (!event.data) {
    throw new Error('iframe通讯异常');
  }

  // iframe页面准备就绪可以进行通信
  if (event.data === PostMessageType.InnerReady) {
    iframeReady = true;
    notifyIframe(PostMessageType.OuterSetConfig);
  } else if (event.data === PostMessageType.InnerFetchApplication) {
    notifyIframe(PostMessageType.OuterSetApplication);
  } else if (event.data.type === PostMessageType.InnerFetchPageComponents) {
    if (event.data.data !== playgroundPath) {
      console.warn('current iframe path not control');
      return;
    }

    if (pageNavCallback) {
      // 内部一般执行 Outer_Full_Update_Components
      pageNavCallback();
      pageNavCallback = null;
    }
  } else {
    const newEvent = new CustomEvent(event.data.type, { detail: event.data.data });
    eventTrigger.dispatchEvent(newEvent);
  }
}

function refresh(callback?: () => void) {
  pageNavCallback = callback;
  const path = `${basePath}${playgroundPath}`;
  iframeDebuggerConfig.controlPage = playgroundPath;

  if (iframe.src === path) {
    notifyIframe(PostMessageType.OuterRefreshPage, path);
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

  if (type === PostMessageType.OuterSetApplication) {
    iframe.contentWindow.postMessage({ type, data: data || applicationData }, '*');
  } else if (type === PostMessageType.OuterSetConfig) {
    iframe.contentWindow.postMessage({ type, data: data || iframeDebuggerConfig }, '*');
  } else if (type === PostMessageType.OuterUpdateComponent) {
    iframe.contentWindow.postMessage({
      type, data: {
        path: iframeDebuggerConfig.controlPage,
        data
      }
    }, '*');
  } else {
    iframe.contentWindow.postMessage({ type, data }, '*');
  }

  const event = new CustomEvent(type, { detail: data });
  eventTrigger.dispatchEvent(event);
}
