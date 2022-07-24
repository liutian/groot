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

  /**
   * 组件设计模式
   */
  public prototypeMode = false;

  public localFrontEndUrl = 'http://localhost:8888';
  public playgroundPath = '/admin/groot/playground';
  public iframeManager: IframeManagerInstance;

  public currActiveTab: 'props' | 'scaffold' = 'props';

  private destroy = false;
  private propHandle: PropHandleModel;
  private navigationPaddingPath: string;

  public inject(propHandle: PropHandleModel) {
    this.propHandle = propHandle;
    this.destroy = false;
  }

  public initIframe(iframe: HTMLIFrameElement, basePath = this.localFrontEndUrl) {
    if (this.destroy) {
      return;
    }

    this.iframeManager = launchIframeManager(iframe, this.propHandle);
    this.iframeManager.setBasePath(basePath);
    if (this.navigationPaddingPath) {
      this.iframeManager.navigation(this.navigationPaddingPath);
    }
  }

  public navigation(path: string) {
    if (!this.iframeManager) {
      this.navigationPaddingPath = path;
    } else {
      this.iframeManager.navigation(path);
    }
  }

  public start(component: Component, prototypeMode: boolean) {
    this.component = component;
    this.prototypeMode = prototypeMode;
    this.propHandle.buildPropTree(component.version.groupList, component.version.blockList, component.version.itemList);
  }

  public destroyModel() {
    this.destroy = true;
    this.iframeManager?.destroyIframe();
  }

}
