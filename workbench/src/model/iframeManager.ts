import { IframeDebuggerConfig, iframeNamePrefix, PostMessageType } from "@grootio/common";
import { metadataFactory } from '@grootio/core';

import PropHandleModel from "@model/PropHandleModel";
import WorkbenchModel from "./WorkbenchModel";


let iframe: HTMLIFrameElement;
let iframeReady = false;
let propHandleModel: PropHandleModel;
let workbenchModel: WorkbenchModel;
let basePath = '';

let fetchPageCallback: () => void;
let fetchPagePath: string;

let iframeDebuggerConfig: IframeDebuggerConfig = {

}


const instancePrototype = {
  destroyIframe,
  refreshComponent,
  navigation,
  setBasePath,
  notifyIframe
}

export type IframeManagerInstance = typeof instancePrototype;

export function launchIframeManager(ele: HTMLIFrameElement, _propHandleModel: PropHandleModel, _workbenchModel: WorkbenchModel): IframeManagerInstance {
  iframe = ele;
  iframe.contentWindow.name = iframeNamePrefix;
  propHandleModel = _propHandleModel;
  workbenchModel = _workbenchModel;

  window.self.addEventListener('message', onMessage);

  // 方法在原型上避免执行视图更新操作
  return Object.create(instancePrototype);
}

function onMessage(event: MessageEvent) {
  // iframe页面准备就绪可以接受外部更新
  if (event.data === PostMessageType.OK) {
    iframeReady = true;
    notifyIframe(PostMessageType.Init_Config);
  } else if (event.data === PostMessageType.Fetch_Application) {
    notifyIframe(PostMessageType.Init_Application);
  } else if (event.data.type === PostMessageType.Fetch_Page) {
    if (event.data.data === fetchPagePath) {
      fetchPageCallback();

      fetchPagePath = null;
      fetchPageCallback = null;
    }
  } else if (event.data.type === PostMessageType.Drag_Hit_Slot) {
    alert('drag hit ' + event.data.data);
  }
}

function navigation(path: string, callback: () => void) {
  fetchPagePath = path;
  fetchPageCallback = callback;
  let iframePath = `${basePath}${path}`;

  iframeDebuggerConfig.controlPage = path;
  if (iframe.src === iframePath) {
    notifyIframe(PostMessageType.Reload_Page, path);
  } else {
    iframe.src = iframePath;
  }
}

function setBasePath(path: string) {
  basePath = path;
}

/**
   * 配置项变动通知iframe更新
   */
function notifyIframe(type: PostMessageType, data?: any) {
  if (!iframeReady) {
    return;
  }

  if (type === PostMessageType.Update_Component) {
    iframe.contentWindow.postMessage({
      type,
      data: data || {
        path: iframeDebuggerConfig.controlPage,
        metadata: data
      }
    }, '*');
  } else if (type === PostMessageType.Init_Application) {
    // todo 重写当前页面组件
    iframe.contentWindow.postMessage({ type, data: data || workbenchModel.applicationData }, '*');
  } else if (type === PostMessageType.Init_Config) {
    iframe.contentWindow.postMessage({ type, data: data || iframeDebuggerConfig }, '*');
  } else {
    iframe.contentWindow.postMessage({ type, data }, '*');
  }

}


// todo
function refreshComponent(component: Component) {
  const metadataId = workbenchModel.prototypeMode ? workbenchModel.component.id : workbenchModel.componentInstance.id;
  const metadata = metadataFactory(propHandleModel.rootGroupList, component, metadataId);
  console.log('<=================== prop object build out =================>\n', metadata.propsObj);
  notifyIframe(PostMessageType.Update_Component, metadata);
}


function destroyIframe() {
  window.self.removeEventListener('message', onMessage);
}
