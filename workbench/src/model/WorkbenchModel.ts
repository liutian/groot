import { ApplicationData, Metadata } from "@grootio/common";
import { IframeManagerInstance, launchIframeManager } from "@model/iframeManager";
import { needRewrite } from "@util/common";
import { ReactNode } from "react";
import PropHandleModel from "./PropHandleModel";

/**
 * 管理编辑器整体UI状态
 */
export default class WorkbenchModel {
  static modelName = 'workbench';

  /**
   * 是否是组件原型设计模式
   */
  public prototypeMode = false;
  public scaffold: Scaffold;
  public component: Component;
  public application: Application;
  public componentInstance: ComponentInstance;

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


  public currActiveTab: 'props' | 'scaffold' = 'props';
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

    this.iframeManager = launchIframeManager(iframe, this);
    this.iframeReadyResolve();
  }

  public startScaffold(component: Component, scaffold: Scaffold) {
    this.prototypeMode = true;
    this.component = component;
    this.scaffold = scaffold;
    this.currActiveTab = 'props';

    const { groupList, blockList, itemList, valueList } = component;
    this.propHandle.buildPropTree(groupList, blockList, itemList, valueList);

    this.iframeReadyPromise.then(() => {
      this.iframeManager.navigation(this.scaffold.playgroundPath, () => {
        this.iframeManager.fullRefreshComponents(this.propHandle.rootGroupList, this.component, this.component.id);
      });
    });
  }

  public startApplication(app: Application) {
    this.prototypeMode = false;
    this.application = app;
  }

  public startPage(rootInstance: ComponentInstance, childrenMetadata: Metadata[], changeHistory = true) {
    this.componentInstance = rootInstance;
    this.component = rootInstance.component;
    this.currActiveTab = 'props';

    const { groupList, blockList, itemList, valueList } = rootInstance;
    const rootGroupList = this.propHandle.buildPropTree(groupList, blockList, itemList, valueList);

    if (changeHistory) {
      window.history.pushState(null, '', `?app=${this.application.id}&release=${this.application.release.id}&page=${rootInstance.id}`);
    }

    this.iframeReadyPromise.then(() => {
      this.iframeManager.navigation(this.application.playgroundPath, () => {
        this.iframeManager.fullRefreshComponents(rootGroupList, this.component, this.componentInstance.id, childrenMetadata);
      });
    })
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
