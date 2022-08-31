import { CodeMetadata } from '@grootio/core';
import { loadWebWorker } from './bootstrap';
import { Page } from './Page';
import { ApplicationDataType, UIManagerInstance, WebWorkerOutputMessage } from './types';
import { errorInfo, iframeNamePrefix, studioMode } from './util';

let manager: UIManagerInstance;
export class Application {
  private allPageMap = new Map<string, Page>();
  private loadedPageMap = new Map<string, Page>();
  studioPage?: Page;
  private activePage?: Page;
  private hostMetadataResove?: (metadata: CodeMetadata) => void;

  private constructor(public name: string, public key: string) {

  }

  static create(data: ApplicationDataType, managerInstance: UIManagerInstance): Application {
    manager = managerInstance;
    const application = new Application(data.name, data.key);
    data.pages.forEach((item) => {
      application.allPageMap.set(item.path, item);
    })

    // 工作台模式
    if (studioMode) {
      // 初始化从name中获取页面信息
      const pageInfo = JSON.parse(window.self.name.replace(new RegExp('^' + iframeNamePrefix), ''));
      application.studioPage = new Page(pageInfo.name, pageInfo.path, manager);
      application.studioPage.hostMetadataPromise = new Promise((resolve) => {
        application.hostMetadataResove = resolve;
      });
      delete application.studioPage.resourceUrl;
      application.allPageMap.set(application.studioPage.path, application.studioPage);

      window.parent!.postMessage('ok', '*');
      window.addEventListener('message', (event: any) => {
        if (event.data.type === 'refresh') {
          const refreshPage = application.allPageMap.get(event.data.path);

          if (!refreshPage) {
            errorInfo('refresh page not found', 'application');
            return;
          }

          if (refreshPage !== application.studioPage) {
            throw new Error('refreshPage is not studioPage');
          }

          // 父级窗口管理的页面是当前项目
          if (application.activePage === refreshPage) {
            if (refreshPage.loadFromHostFirst === false) {
              application.hostMetadataResove!(event.data.metadata);
              refreshPage.loadFromHostFirst = true;
            } else {
              refreshPage.createModuleByWorker(event.data.metadata);
            }
          }
        }
      })
    }

    return application;
  }

  hasPage(path: string): boolean {
    return this.allPageMap.has(path);
  }

  loadPage(path: string): Promise<Page> | Page {
    const page = this.allPageMap.get(path);
    this.activePage = page;

    if (this.loadedPageMap.has(path)) {
      return this.loadedPageMap.get(path)!;
    }

    if (!page) {
      return Promise.reject(new Error('not found page'));
    }

    if (!page.resourceUrl && !manager.worker) {
      this.initWorker();
    }

    return page.loadModule().then(() => {
      this.loadedPageMap.set(path, page);
      return page;
    });
  }

  /**
   * 初始化
   */
  private initWorker() {
    loadWebWorker();

    manager.worker!.addEventListener(
      'message',
      ({ data: { type, code, path } }: { data: WebWorkerOutputMessage }) => {
        if (type === 'emitCode') {
          const page = this.allPageMap.get(path);
          page?.execCode(code);
        }
      }
    );
  }
}


