import { IframeDebuggerConfig, iframeNamePrefix, Metadata, PostMessageType, PropBlockStructType, PropItemType, PropMetadataType, PropValueType } from "@grootio/common";
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
  createComponentMetadata,
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
function refreshComponent(component: Component) {
  const metadata = createComponentMetadata(component);
  console.log('<=================== prop object build out =================>\n', metadata.propsObj);
  notifyIframe(PostMessageType.Update_Component, metadata);
}

function createComponentMetadata(component: Component) {
  const metadata = {
    id: component.id,
    packageName: component.packageName,
    componentName: component.componentName,
    propsObj: {},
    advancedProps: []
  } as Metadata;

  propHandleModel.rootGroupList.forEach((group) => {
    if (group.propKey) {
      const ctx = fillPropChainGreed(metadata.propsObj, group.propKey);
      buildPropObject(group, ctx, group.propKey, metadata);
    } else {
      buildPropObject(group, metadata.propsObj, '', metadata);
    }
  });

  return metadata;
}

function buildPropObject(group: PropGroup, ctx: Object, ctxKeyChain: string, metadata: Metadata, parentValueList?: PropValue[]) {
  group.propBlockList.forEach((block) => {
    const preCTX = ctx;
    const preCTXKeyChain = ctxKeyChain;

    if (block.propKey) {
      if (block.rootPropKey) {
        ctx = fillPropChainGreed(metadata.propsObj, block.propKey, block.struct === PropBlockStructType.List);
        ctxKeyChain = block.propKey;
      } else {
        ctx = fillPropChainGreed(ctx, block.propKey, block.struct === PropBlockStructType.List);
        ctxKeyChain += `.${block.propKey}`;
      }
    } else {
      if (block.struct === PropBlockStructType.List) {
        throw new Error('when block struct list, propKey cannot be empty');
      }
    }

    if (block.struct === PropBlockStructType.List) {
      const childPropItem = block.propItemList[0];
      const propValueList = childPropItem.valueList;
      propValueList.forEach((propValue, propValueIndex) => {
        const preCTX = ctx;
        const preCTXKeyChain = ctxKeyChain;

        ctx = ctx[propValueIndex] = {};
        ctxKeyChain += `[${propValueIndex}]`;
        if (Array.isArray(parentValueList)) {
          parentValueList.push(propValue);
        } else {
          parentValueList = [propValue];
        }
        buildPropObject(childPropItem.childGroup, ctx, ctxKeyChain, metadata, parentValueList);

        ctx = preCTX;
        ctxKeyChain = preCTXKeyChain;
      });
    } else {
      block.propItemList.forEach((propItem) => {
        const preCTX = ctx;
        const preCTXKeyChain = ctxKeyChain;

        buildPropObjectForItem(propItem, ctx, ctxKeyChain, metadata, parentValueList);

        ctx = preCTX;
        ctxKeyChain = preCTXKeyChain;
      });
    }

    ctx = preCTX;
    ctxKeyChain = preCTXKeyChain;
  })
}

function buildPropObjectForItem(item: PropItem, ctx: Object, ctxKeyChain: string, metadata: Metadata, parentValueList?: PropValue[]) {
  const preCTX = ctx;
  const preCTXKeyChain = ctxKeyChain;

  if (!item.propKey && !item.childGroup) {
    throw new Error('propKey can not empty');
  }

  if (item.rootPropKey) {
    ctx = fillPropChainGreed(metadata.propsObj, item.propKey);
    ctxKeyChain = item.propKey;
  } else {
    ctx = fillPropChainGreed(ctx, item.propKey);
    ctxKeyChain += `.${item.propKey}`;
  }

  if (item.childGroup) {
    buildPropObject(item.childGroup, ctx, ctxKeyChain, metadata, parentValueList);
  } else {
    buildPropObjectForLeafItem(item, ctx, ctxKeyChain, metadata, parentValueList);
  }

  ctx = preCTX;
  ctxKeyChain = preCTXKeyChain;
}

function buildPropObjectForLeafItem(propItem: PropItem, ctx: Object, ctxKeyChain: string, metadata: Metadata, parentValueList?: PropValue[]) {
  const [newCTX, propEnd] = fillPropChain(propItem.rootPropKey ? metadata.propsObj : ctx, propItem.propKey);
  ctxKeyChain = propItem.rootPropKey ? propItem.propKey : `${ctxKeyChain}.${propItem.propKey}`;

  if (parentValueList?.length) {
    const propValueRegex = new RegExp(parentValueList.join(',.*'));
    const propValue = propItem.valueList.find((v) => propValueRegex.test(v.propValueIdChainForBlockListStruct));
    if (propValue) {
      newCTX[propEnd] = propValue.value;
    }
  } else if (propItem.valueList?.length) {
    newCTX[propEnd] = propItem.valueList[0]?.value;
  } else {
    newCTX[propEnd] = propItem.defaultValue;
  }

  if (propItem.type === PropItemType.Json) {
    metadata.advancedProps.push({
      keyChain: ctxKeyChain,
      type: PropMetadataType.Json,
    })
  } else if (propItem.type === PropItemType.Function) {
    metadata.advancedProps.push({
      keyChain: ctxKeyChain,
      type: PropMetadataType.Function,
    })
  }
}

function destroyIframe() {
  window.self.removeEventListener('message', onMessage);
}
