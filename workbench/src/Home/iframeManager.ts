import { ApplicationData, IframeHostConfig, PostMessageType } from "@grootio/types";
import WorkbenchModel from "@model/WorkbenchModel";
import { NotifyType } from "@util/types";
import { fillPropChain, fillPropChainGreed } from "@util/utils";

let iframe: HTMLIFrameElement;
let iframeReady = false;
let workbenchModel: WorkbenchModel;

let iframeHostConfig: IframeHostConfig = {
  localServerUrl: 'http://localhost:8888'
}

let applicationData = {
  name: 'demo',
  key: 'demo',
  pages: [
    {
      path: '/admin/groot/playground',
      metadataList: [
        {
          id: 1,
          parentId: null,
          packageName: 'groot',
          moduleName: 'Container',
          advancedProps: [{
            keyChain: 'children',
            type: 'component',
          }],
          propsObj: {
            children: [2]
          }
        },
        {
          id: 2,
          parentId: 1,
          packageName: 'antd',
          moduleName: 'Button',

          propsObj: {
            type: 'primary',
            children: 'demo1'
          }
        }
      ]
    }
  ]
} as ApplicationData;

let propObject = {};

const instance = {
  destroyIframe,
  refreshComponent,
  navigation
}

export type IframeManagerInstance = typeof instance;

export function launchIframeManager(ele: HTMLIFrameElement, model: WorkbenchModel): IframeManagerInstance {
  iframe = ele;
  workbenchModel = model;
  window.self.addEventListener('message', onMessage);

  return instance;
}

function onMessage(event: MessageEvent) {
  // iframe页面准备就绪可以接受外部更新
  if (event.data === PostMessageType.OK) {
    iframeReady = true;
  } else if (event.data === PostMessageType.Fetch_Application) {
    notifyIframe(NotifyType.InitApplication);
  } else if (event.data === PostMessageType.Ready_Page) {
    refreshComponent();
  }
}

function navigation(path: string) {
  let iframePath: string;

  if (iframeHostConfig.localServerUrl) {
    iframePath = iframeHostConfig.localServerUrl + path
  } else {
    iframePath = workbenchModel.component.application.serverUrl + path;
  }

  iframeHostConfig.controlPage = iframePath;
  iframe.contentWindow.name = `groot::${JSON.stringify(iframeHostConfig)}`;
  iframe.setAttribute('src', iframePath);
}

/**
   * 配置项变动通知iframe更新
   */
function notifyIframe(type: NotifyType, data?: any) {
  if (!iframeReady) {
    return;
  }

  if (type === NotifyType.RefreshComponent) {
    iframe.contentWindow.postMessage({
      type,
      data: data || {
        path: iframeHostConfig.controlPage,
        metadata: {
          id: 2,
          propsObj: propObject
        }
      }
    }, '*');
  } else if (type === NotifyType.InitApplication) {
    iframe.contentWindow.postMessage({
      type,
      data: data || applicationData
    }, '*');
  }

}

// todo
function refreshComponent() {
  Object.keys(propObject).forEach(k => delete propObject[k]);
  workbenchModel.rootGroupList.forEach((group) => {
    if (group.propKey) {
      const ctx = fillPropChainGreed(propObject, group.propKey);
      buildPropObject(group, ctx);
    } else {
      buildPropObject(group, propObject);
    }
  });
  console.log('<=================== prop object build out =================>\n', propObject);
  notifyIframe(NotifyType.RefreshComponent);
}

function buildPropObject(group: PropGroup, ctx: Object) {
  group.propBlockList.forEach((block) => {
    const preCTX = ctx;
    if (group.struct === 'Default' && block.propKey) {
      if (block.rootPropKey) {
        ctx = fillPropChainGreed(propObject, block.propKey);
      } else {
        ctx = fillPropChainGreed(ctx, block.propKey);
      }
    }

    const blockFormObj = workbenchModel.blockFormInstanceMap.get(block.id)?.getFieldsValue() || {};
    block.propItemList.forEach((item) => {
      const preCTX = ctx;

      if (!item.propKey) {
        throw new Error('propKey can not null');
      }

      if (['List', 'Item', 'Hierarchy'].includes(item.type)) {
        if (item.rootPropKey) {
          ctx = fillPropChainGreed(propObject, item.propKey);
        } else {
          ctx = fillPropChainGreed(ctx, item.propKey);
        }
        buildPropObject(item.valueOfGroup, ctx);
      } else {
        const [newCTX, propEnd] = fillPropChain(item.rootPropKey ? propObject : ctx, item.propKey);
        newCTX[propEnd] = blockFormObj[item.propKey] || item.defaultValue;
      }

      ctx = preCTX;
    });

    ctx = preCTX;
  })
}

function destroyIframe() {
  window.self.removeEventListener('message', onMessage);
}
