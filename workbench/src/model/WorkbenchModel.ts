import { ApplicationData } from "@grootio/common";
import { iframeDebuggerConfig, IframeManagerInstance, launchIframeManager } from "@model/iframeManager";
import { needRewrite } from "@util/common";
import { ReactNode } from "react";
import PropHandleModel from "./PropHandleModel";

/**
 * 管理编辑器整体UI状态
 */
export default class WorkbenchModel extends EventTarget {
  static modelName = 'workbench';

  /**
   * 是否是组件原型设计模式
   */
  public prototypeMode = false;
  public org: Organization;
  public component: Component;
  public componentVersion: ComponentVersion;
  public application: Application;
  public componentInstance: ComponentInstance;
  public instanceList: ComponentInstance[] = [];

  /**
   * iframe之上的遮罩层用于组件拖拽定位和侧边栏宽度缩放
   */
  public iframeDragMaskId = 'iframe-drag-mask';
  /**
   * 真正和iframe进行通信的对象
   */
  public iframeManager: IframeManagerInstance;
  public iframeBasePath = 'http://localhost:8888';
  private iframeReadyPromise: Promise<any>;
  private iframeReadyResolve: Function;

  public currActiveTab: 'props' = 'props';
  /**
   * 窗口部件缩放大小
   */
  public widgetWindowRect: 'min' | 'full' | 'normal' | 'none' | { x?: number, y?: number, width?: number, height?: number } = 'min';
  /**
   * 侧边栏拖拽最小宽度
   */
  public minSideWidth = 480;
  /**
   * 用于快速显示鼠标所在配置项对应的属性链
   */
  public propPathChainEle: HTMLElement;
  /**
   * 自定义属性编辑器底部区域
   */
  public renderFooterLeftActionItems: (() => ReactNode)[] = [];
  /**
   * 自定义属性编辑器tab面板
   */
  public renderExtraTabPanes: (() => ReactNode)[] = [];
  /**
   * 管理属性编辑器内属性面板UI状态
   */
  public propHandle: PropHandleModel;

  public constructor() {
    super();
    this.iframeReadyPromise = new Promise((resolve) => {
      this.iframeReadyResolve = resolve;
    });
  }

  public inject(propHandle: PropHandleModel) {
    this.propHandle = propHandle;
  }

  public initIframe(iframe: HTMLIFrameElement) {
    if (this.iframeManager) {
      return;
    }

    const playgroundPath = this.prototypeMode ? this.org.playgroundPath : this.application.playgroundPath;
    const appData = this.buildApplicationData(playgroundPath);
    this.iframeManager = launchIframeManager(iframe, this.iframeBasePath, playgroundPath, appData, this);
    this.iframeReadyResolve();
  }

  public launchPrototypeBox(org: Organization) {
    this.prototypeMode = true;
    iframeDebuggerConfig.runtimeConfig.prototypeMode = true;
    this.org = org;
  }

  public startComponentPrototype(component: Component,) {
    this.component = component;
    this.componentVersion = component.componentVersion;
    this.currActiveTab = 'props';

    const { groupList, blockList, itemList, valueList } = component;
    this.propHandle.buildPropTree(groupList, blockList, itemList, valueList);

    this.iframeReadyPromise.then(() => {
      this.iframeManager.refresh(() => {
        this.propHandle.refreshComponent();
      });
    });

    window.history.pushState(null, '', `?org=${this.org.id}&version=${this.componentVersion.id}&component=${component.id}`);
  }

  public launchInstanceBox(app: Application) {
    this.prototypeMode = false;
    iframeDebuggerConfig.runtimeConfig.prototypeMode = false;
    this.application = app;
  }

  public startComponentInstance(rootInstance: ComponentInstance, childrenInstance: ComponentInstance[]) {
    this.componentInstance = rootInstance;
    this.component = rootInstance.component;
    this.componentVersion = rootInstance.componentVersion;
    this.instanceList = [rootInstance, ...childrenInstance];
    this.currActiveTab = 'props';

    const { groupList, blockList, itemList, valueList } = rootInstance;
    const propTree = this.propHandle.buildPropTree(groupList, blockList, itemList, valueList);
    rootInstance.propTree = propTree;

    this.iframeReadyPromise.then(() => {
      this.iframeManager.refresh(() => {
        this.propHandle.refreshAllComponent();
      });
    });

    window.history.pushState(null, '', `?app=${this.application.id}&release=${this.application.release.id}&page=${rootInstance.id}`);

  }

  public changeComponentInstance(instance: ComponentInstance) {
    this.componentInstance = instance;
    this.component = instance.component;
    this.componentVersion = instance.componentVersion;
    this.currActiveTab = 'props';
    this.propHandle.setPropTree(instance);
  }

  public setPropPathChain(itemId?: number) {
    if (!this.propPathChainEle) {
      return;
    }

    if (!itemId) {
      this.propPathChainEle.innerText = '';
      this.propPathChainEle.dataset['activeId'] = '';
      return;
    }

    const activeId = this.propPathChainEle.dataset['activeId'];
    if (+activeId === itemId) {
      return;
    }

    let path = [];
    const result = this.propHandle.getPropItem(itemId, path as any);
    if (!result) {
      throw new Error(`not found propItem id: ${itemId}`);
    }
    const propKeyList = path.reduce((pre, current, index) => {
      if (index % 3 === 0) {
        const group = current as PropGroup;
        if (group.root && group.propKey) {
          pre.push(group.propKey);
        }
      } else if (index % 3 === 1) {
        const block = current as PropBlock;
        if (block.propKey) {
          pre.push(block.propKey);
        }
      } else if (index % 3 === 2) {
        const item = current as PropItem;
        pre.push(item.propKey);
      }

      return pre;
    }, []) as string[];

    this.propPathChainEle.innerText = propKeyList.join('.');
    this.propPathChainEle.dataset['activeId'] = `${itemId}`;
  }

  public buildApplicationData(playgroundPath: string) {
    const name = this.prototypeMode ? '原型' : '实例';
    const key = this.prototypeMode ? 'prototype-demo' : 'instance-demo';

    const instanceData = {
      key: playgroundPath,
      metadataList: []
    };

    const appData: ApplicationData = {
      name,
      key,
      instances: [instanceData],
      envData: {}
    };

    return appData;
  }

  public renderToolBarBreadcrumb(): ReactNode {
    return needRewrite();
  }
  public renderToolBarAction(): ReactNode {
    return needRewrite();
  }
  public switchComponentInstance(instanceId: number) {
    needRewrite();
  }
}
