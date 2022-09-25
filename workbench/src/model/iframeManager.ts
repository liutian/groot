import { IframeDebuggerConfig, iframeNamePrefix, PostMessageType } from "@grootio/common";
import { metadataFactory, propTreeFactory } from '@grootio/core';

import WorkbenchModel from "./WorkbenchModel";


let iframe: HTMLIFrameElement;
let iframeReady = false;
let activePagePath: string;
let iframeDebuggerConfig: IframeDebuggerConfig = {

}
let applicationData;

let workbenchModel: WorkbenchModel;
let pageNavCallback: () => void;


const instancePrototype = {
  refreshComponent,
  navigation,
  notifyIframe,
  fullRefreshComponent
}

export type IframeManagerInstance = typeof instancePrototype;

export function launchIframeManager(ele: HTMLIFrameElement, _workbenchModel: WorkbenchModel): IframeManagerInstance {
  iframe = ele;
  iframe.contentWindow.name = iframeNamePrefix;
  workbenchModel = _workbenchModel;

  window.self.addEventListener('message', onMessage);

  if (_workbenchModel.prototypeMode) {
    applicationData = buildApplicationData('scaffold', _workbenchModel.scaffold.playgroundPath);
  } else {
    applicationData = buildApplicationData('instance', _workbenchModel.application.playgroundPath);
  }

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
    if (event.data.data !== activePagePath) {
      console.warn('current iframe path not control');
      return;
    }

    pageNavCallback();// 内部一般执行 Outer_Set_Page
    activePagePath = null; // 保证只响应一次 Inner_Fetch_Page
    pageNavCallback = null;
  } else if (event.data.type === PostMessageType.Drag_Hit_Slot) {
    alert('drag hit ' + event.data.data);
  }
}

function navigation(path: string, callback: () => void) {
  activePagePath = path;
  pageNavCallback = callback;
  let iframePath = `${workbenchModel.iframeBasePath}${path}`;

  iframeDebuggerConfig.controlPage = path;
  if (iframe.src === iframePath) {
    notifyIframe(PostMessageType.Outer_Refresh_Page, path);
  } else {
    iframe.src = iframePath;
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

  if (type === PostMessageType.Outer_Update_Component) {
    iframe.contentWindow.postMessage({
      type, data: data || {
        path: iframeDebuggerConfig.controlPage,
        metadata: data
      }
    }, '*');
  } else if (type === PostMessageType.Outer_Set_Application) {
    iframe.contentWindow.postMessage({ type, data: data || applicationData }, '*');
  } else if (type === PostMessageType.Outer_Set_Config) {
    iframe.contentWindow.postMessage({ type, data: data || iframeDebuggerConfig }, '*');
  } else {
    iframe.contentWindow.postMessage({ type, data }, '*');
  }

}

function refreshComponent() {
  const metadataId = workbenchModel.prototypeMode ? workbenchModel.component.id : workbenchModel.componentInstance.id;
  const metadata = metadataFactory(workbenchModel.propHandle.rootGroupList, workbenchModel.component, metadataId);
  console.log('<=================== prop object build out =================>\n', metadata.propsObj);
  notifyIframe(PostMessageType.Outer_Update_Component, metadata);
}

function fullRefreshComponent(instanceChildren: ComponentInstance[] = []) {
  const rootMetadataId = workbenchModel.prototypeMode ? workbenchModel.component.id : workbenchModel.componentInstance.id;
  const rootMetadata = metadataFactory(workbenchModel.propHandle.rootGroupList, workbenchModel.component, rootMetadataId);

  const childrenMetadata = instanceChildren.map((instance) => {
    const { groupList, blockList, itemList } = instance;
    const valueList = instance.valueList;
    const propTree = propTreeFactory(groupList, blockList, itemList, valueList) as PropGroup[];
    const metadata = metadataFactory(propTree, instance.component, instance.id);
    return metadata;
  })

  notifyIframe(PostMessageType.Outer_Full_Update_Components, { path: activePagePath, metadataList: [rootMetadata, ...childrenMetadata] });
}

function buildApplicationData(name: string, playgroundPath: string) {
  const pageData = {
    path: playgroundPath,
    metadataList: []
  };

  const appData = {
    name,
    key: `${workbenchModel.prototypeMode ? 'scaffold' : 'app'}-demo`,
    pages: [pageData],
    envData: {}
  };

  return appData;
}