import { IframeDebuggerConfig, iframeNamePrefix, Metadata, PostMessageType, PropItemType, PropMetadata, PropMetadataType } from "@grootio/common";
import PropHandleModel from "@model/PropHandleModel";
import { fillPropChain, fillPropChainGreed } from "@util/utils";
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
  buildMetadata,
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
  }
}

function buildMetadata(component: Component): Metadata {
  const metadata = {
    id: component.id,
    packageName: component.packageName,
    componentName: component.componentName,
    propsObj: {},
    advancedProps: []
  } as Metadata;
  propHandleModel.rootGroupList.forEach((group) => {
    if (group.propKey) {
      const ctx = fillPropChainGreed(metadata.propsObj, group.propKey, group.struct === 'List');
      buildPropObject(group, ctx, group.propKey, metadata);
    } else {
      buildPropObject(group, metadata.propsObj, '', metadata);
    }
  });

  return metadata;
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
  } else if (type === PostMessageType.Reload_Page) {
    iframe.contentWindow.postMessage({ type, data }, '*');
  } else if (type.startsWith(PostMessageType.Init_Page)) {
    iframe.contentWindow.postMessage({ type, data }, '*');
  }

}

// todo
function refreshComponent() {
  const metadata: Metadata = {
    packageName: workbenchModel.component.packageName,
    componentName: workbenchModel.component.componentName,
    id: workbenchModel.component.id,
    propsObj: {},
    advancedProps: []
  };
  propHandleModel.rootGroupList.forEach((group) => {
    if (group.propKey) {
      const ctx = fillPropChainGreed(metadata.propsObj, group.propKey, group.struct === 'List');
      buildPropObject(group, ctx, group.propKey, metadata);
    } else {
      buildPropObject(group, metadata.propsObj, '', metadata);
    }
  });
  console.log('<=================== prop object build out =================>\n', metadata.propsObj);
  notifyIframe(PostMessageType.Update_Component, metadata);
}

function buildPropObject(group: PropGroup, ctx: Object, ctxKeyChain: string, metadata: Metadata) {
  group.propBlockList.forEach((block, index) => {
    const preCTX = ctx;
    const preCTXKeyChain = ctxKeyChain;
    if (group.struct === 'Default' && block.propKey) {
      if (block.rootPropKey) {
        ctx = fillPropChainGreed(metadata.propsObj, block.propKey);
        ctxKeyChain = block.propKey;
      } else {
        ctx = fillPropChainGreed(ctx, block.propKey);
        ctxKeyChain += `.${block.propKey}`;
      }
    } else if (group.struct === 'List') {
      const blockObj = {};
      ctxKeyChain += `.[${index}]`;
      (ctx as any[]).push(blockObj);
      ctx = blockObj;
    }

    const blockFormObj = propHandleModel.blockFormInstanceMap.get(block.id)?.getFieldsValue() || {};
    block.propItemList.forEach((item) => {
      const preCTX = ctx;
      const preCTXKeyChain = ctxKeyChain;

      if (!item.propKey) {
        throw new Error('propKey can not null');
      }

      if ([PropItemType.LIST, PropItemType.ITEM, PropItemType.HIERARCHY].includes(item.type as any)) {
        if (item.rootPropKey) {
          ctx = fillPropChainGreed(metadata.propsObj, item.propKey, item.type === PropItemType.LIST);
          ctxKeyChain = item.propKey;
        } else {
          ctx = fillPropChainGreed(ctx, item.propKey, item.type === PropItemType.LIST);
          ctxKeyChain += `.${item.propKey}`;
        }
        buildPropObject(item.valueOfGroup, ctx, ctxKeyChain, metadata);
      } else {
        const [newCTX, propEnd] = fillPropChain(item.rootPropKey ? metadata.propsObj : ctx, item.propKey);
        ctxKeyChain = item.rootPropKey ? item.propKey : `${ctxKeyChain}.${item.propKey}`;
        newCTX[propEnd] = blockFormObj[item.propKey] || item.defaultValue;
        ctxKeyChain = ctxKeyChain.replace(/^\./, '');
        if (item.type === 'Json') {
          metadata.advancedProps.push({
            keyChain: ctxKeyChain,
            type: PropMetadataType.Json,
          })
        } else if (item.type === 'Function') {
          metadata.advancedProps.push({
            keyChain: ctxKeyChain,
            type: PropMetadataType.Function,
          })
        }
      }

      ctx = preCTX;
      ctxKeyChain = preCTXKeyChain;
    });

    ctx = preCTX;
    ctxKeyChain = preCTXKeyChain
  })
}

function destroyIframe() {
  window.self.removeEventListener('message', onMessage);
}
