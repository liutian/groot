import { ApplicationData, PostMessageType } from "@grootio/common";
import { IframeManagerInstance, launchIframeManager } from "@model/iframeManager";
import PropHandleModel from "./PropHandleModel";


export default class WorkbenchModel {
  static modelName = 'workbench';
  /**
   * 窗口部件缩放大小
   */
  public widgetWindowRect: 'min' | 'full' | 'normal' | 'none' | { x?: number, y?: number, width?: number, height?: number } = 'min';
  /**
   * 侧边栏拖拽最小宽度
   */
  public minSideWidth = 480;
  /**
   * 组件信息
   */
  public component: Component;

  public componentInstance: ComponentInstance;

  /**
   * 组件设计模式
   */
  public prototypeMode = false;

  public localFrontEndUrl = 'http://localhost:8888';
  public iframeManager: IframeManagerInstance;

  public currActiveTab: 'props' | 'scaffold' = 'props';

  public scaffold: Scaffold;
  public application: Application;

  public applicationData: ApplicationData;

  public propPathChainEle: HTMLElement;

  private destroy = false;
  private propHandle: PropHandleModel;

  public inject(propHandle: PropHandleModel) {
    this.propHandle = propHandle;
    this.destroy = false;
  }

  public initIframe(iframe: HTMLIFrameElement, basePath = this.localFrontEndUrl) {
    if (this.destroy) {
      return;
    }

    this.iframeManager = launchIframeManager(iframe, this.propHandle, this);
    this.iframeManager.setBasePath(basePath);
  }

  public startScaffold(component: Component, scaffold: Scaffold) {
    this.component = component;
    this.scaffold = scaffold;
    this.prototypeMode = true;

    const { groupList, blockList, itemList, valueList } = component.version;
    this.propHandle.buildPropTree(groupList, blockList, itemList, valueList);

    this.applicationData = this.buildApplicationData(scaffold);

    this.iframeManager.navigation(this.scaffold.playgroundPath, () => {
      const metadata = this.iframeManager.createComponentMetadata(this.component);
      this.iframeManager.notifyIframe(PostMessageType.Init_Page, { path: this.scaffold.playgroundPath, metadataList: [metadata] });
    });
  }

  public startApplication(component: Component, application: Application) {
    this.component = component;
    this.application = application;
    this.prototypeMode = false;

    const { groupList, blockList, itemList, valueList } = component.version;
    this.propHandle.buildPropTree(groupList, blockList, itemList, valueList);

    // this.applicationData = this.buildApplicationData(scaffold);

    // this.iframeManager.navigation(this.application.playgroundPath, () => {
    //   const metadata = this.iframeManager.buildMetadata(this.component);
    //   this.iframeManager.notifyIframe(PostMessageType.Init_Page, { path: this.scaffold.playgroundPath, metadataList: [metadata] });
    // });
  }

  public destroyModel() {
    this.destroy = true;
    this.iframeManager?.destroyIframe();
  }

  private buildApplicationData(scaffold: Scaffold) {
    const pageData = {
      path: scaffold.playgroundPath,
      metadataList: []
    };

    const applicationData = {
      name: scaffold.name,
      key: 'scaffold-demo',
      pages: [pageData]
    };

    return applicationData;
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

}
