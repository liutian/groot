import { PostMessageType } from "@grootio/types";
import WorkbenchModel from "@model/WorkbenchModel";
import { NotifyType } from "@util/types";

let iframe: HTMLIFrameElement;
let workbenchModel: WorkbenchModel;
let iframeReady = false;

export const startManageIframe = (ele: HTMLIFrameElement, model: WorkbenchModel) => {
  iframe = ele;
  workbenchModel = model;
  // 提供给iframe页面mock数据（正常情况需要iframe页面通过接口获取元数据信息）
  iframe.setAttribute('name', `groot::${JSON.stringify(workbenchModel.iframeHostConnfig)}`);

  // 在iframe页面加载完成之后，自动进行首次数据推送
  window.self.addEventListener('message', onMessage);
}

const onMessage = (event: MessageEvent) => {
  // iframe页面准备就绪可以接受外部更新
  if (event.data === PostMessageType.OK) {
    iframeReady = true;
  } else if (event.data === PostMessageType.Fetch_Application) {
    if (workbenchModel.iframeHostConnfig.rewriteApplicationData) {
      notifyIframe(NotifyType.InitApplication);
    } else {
      throw new Error('rewriteApplicationData is false');
    }
  } else if (event.data === PostMessageType.Ready_Page) {
    // 首次通知更新数据
    notifyIframe(NotifyType.RefreshComponent);
  }
}


/**
   * 配置项变动通知iframe更新
   */
export const notifyIframe = (type: NotifyType, data?: any) => {
  if (!iframeReady) {
    return;
  }

  if (type === NotifyType.RefreshComponent) {
    iframe.contentWindow.postMessage({
      type,
      data: data || {
        path: workbenchModel.iframePath,
        metadata: {
          id: 2,
          propsObj: workbenchModel.propObject
        }
      }
    }, '*');
  } else if (type === NotifyType.InitApplication) {
    iframe.contentWindow.postMessage({
      type,
      data: data || workbenchModel.applicationData
    }, '*');
  }

}


export const destroyIframe = () => {
  window.self.removeEventListener('message', onMessage);
}
