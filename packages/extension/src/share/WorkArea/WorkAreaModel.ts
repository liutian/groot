import { ApplicationData, BaseModel, IframeDebuggerConfig, iframeNamePrefix, Metadata, PostMessageType } from "@grootio/common";

import { commandBridge, getContext, grootCommandManager, grootHookManager, grootStateManager, isPrototypeMode } from "context";

export default class WorkAreaModel extends BaseModel {
  static modelName = 'workArea';

  public iframeEle: HTMLIFrameElement;
  private iframeReady = false
  private iframeDebuggerConfig: IframeDebuggerConfig = {
    runtimeConfig: {}
  }
  private pageNavCallback: Function;
  private viewData: Metadata | Metadata[]

  public initIframe(iframe: HTMLIFrameElement) {
    const { mode } = getContext().groot.params

    this.iframeEle = iframe;
    this.iframeEle.contentWindow.name = `${iframeNamePrefix}${mode}`;

    // 传递基本信息
    window.self.addEventListener('message', this.onMessage);
    this.initListener()
  }


  private onMessage = (event: MessageEvent) => {
    if (!event.data) {
      throw new Error('iframe通讯数据无效');
    }

    const { callHook } = grootHookManager()

    const eventTypeList = [
      PostMessageType.InnerReady,
      PostMessageType.InnerFetchApplication,
      PostMessageType.InnerApplicationnReady,
      PostMessageType.InnerFetchView,
      PostMessageType.InnerDragHitSlot,
      PostMessageType.InnerUpdateDragAnchor,
      PostMessageType.InnerOutlineHover,
      PostMessageType.InnerOutlineSelect,
      PostMessageType.InnerOutlineUpdate
    ]

    if (eventTypeList.includes(event.data.type)) {
      callHook(event.data.type, event.data.data)
    } else {
      console.warn(`未知的iframe消息: ${event.data.type}`)
    }

  }

  public initListener = () => {

    const guard = () => {
      if (!this.iframeReady) {
        throw new Error('iframe not ready!!!');
      }
    }

    const { registerHook, callHook } = grootHookManager()
    const { executeCommand } = grootCommandManager();

    registerHook(PostMessageType.InnerReady, () => {
      this.iframeReady = true;
      callHook(PostMessageType.OuterSetConfig)
    })

    registerHook(PostMessageType.OuterSetConfig, (config) => {
      guard();
      const messageData = config || this.iframeDebuggerConfig
      this.iframeEle.contentWindow.postMessage({ type: PostMessageType.OuterSetConfig, data: messageData }, '*');
    })

    registerHook(PostMessageType.InnerFetchApplication, () => {
      guard();
      callHook(PostMessageType.OuterSetApplication)
    })

    registerHook(PostMessageType.OuterSetApplication, (appData) => {
      guard();
      const messageData = appData || this.buildApplicationData(grootStateManager().getState('gs.stage.playgroundPath'));
      this.iframeEle.contentWindow.postMessage({ type: PostMessageType.OuterSetApplication, data: messageData }, '*');
    })

    registerHook(PostMessageType.InnerFetchView, () => {
      guard();
      if (this.viewData) {
        callHook(PostMessageType.OuterUpdateComponent, this.viewData);
      }

      if (this.pageNavCallback) {
        // 内部一般执行 组件刷新操作
        this.pageNavCallback();
        this.pageNavCallback = null;
      }
    })

    registerHook(PostMessageType.OuterUpdateComponent, (data) => {
      guard();
      this.iframeEle.contentWindow.postMessage({
        type: PostMessageType.OuterUpdateComponent,
        data: {
          key: this.iframeDebuggerConfig.controlView,
          data
        }
      }, '*');
    })

    registerHook(PostMessageType.OuterRefreshView, (path) => {
      guard()
      this.iframeEle.contentWindow.postMessage({
        type: PostMessageType.OuterRefreshView,
        data: path
      }, '*');
    })

    registerHook(PostMessageType.OuterDragComponentEnter, () => {
      guard()
      this.iframeEle.contentWindow.postMessage({
        type: PostMessageType.OuterDragComponentEnter,
      }, '*');
    })

    registerHook(PostMessageType.OuterDragComponentOver, (data) => {
      guard()
      this.iframeEle.contentWindow.postMessage({
        type: PostMessageType.OuterDragComponentOver,
        data
      }, '*');
    })

    registerHook(PostMessageType.OuterDragComponentLeave, () => {
      guard()
      this.iframeEle.contentWindow.postMessage({
        type: PostMessageType.OuterDragComponentLeave,
      }, '*');
    })

    registerHook(PostMessageType.OuterDragComponentDrop, (data) => {
      guard()
      this.iframeEle.contentWindow.postMessage({
        type: PostMessageType.OuterDragComponentDrop,
        data
      }, '*');
    })

    registerHook(PostMessageType.OuterComponentSelect, (data) => {
      guard()
      this.iframeEle.contentWindow.postMessage({
        type: PostMessageType.OuterComponentSelect,
        data
      }, '*');
    })

    commandBridge.stageRefresh = this.refresh;

    registerHook('gh.component.propChange', (data, first = false) => {
      if (first) {
        executeCommand('gc.stageRefresh')
      } else {
        callHook(PostMessageType.OuterUpdateComponent, data);
      }
      this.viewData = data;
    }, true)
  }

  private refresh = (callback?: Function) => {
    this.pageNavCallback = callback;

    const iframeBasePath = grootStateManager().getState('gs.stage.debugBaseUrl')
    const playgroundPath = grootStateManager().getState('gs.stage.playgroundPath')
    const path = `${iframeBasePath}${playgroundPath}`;
    if (this.iframeEle.src) {
      if (this.iframeEle.src === path) {
        grootHookManager().callHook(PostMessageType.OuterRefreshView, path)
      } else {
        this.viewData = null;
        this.iframeDebuggerConfig.controlView = playgroundPath;
        this.iframeEle.src = path;
      }
    } else {
      this.iframeDebuggerConfig.controlView = playgroundPath;
      this.iframeEle.src = path;
    }
  }

  private buildApplicationData(playgroundPath: string) {
    const name = isPrototypeMode() ? '原型' : '实例';
    const key = isPrototypeMode() ? 'prototype-demo' : 'instance-demo';

    const viewData = {
      key: playgroundPath,
      metadataList: []
    };

    const appData: ApplicationData = {
      name,
      key,
      views: [viewData],
      envData: {}
    };

    return appData;
  }
}