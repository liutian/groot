import { CodeMetadata } from '@groot/core';
import { instance, loadWebWorker, iframeNamePrefix } from './config';
import { WebWorkerInputMessage, WebWorkerOutputMessage } from './types';
import { errorInfo } from './util';

export class Project {
  private allPageMap = new Map<string, Page>();
  private loadedPageMap = new Map<string, Page>();
  private hostHandlePage!: Page;

  private constructor(public name: string, public key: string, public studioMode: boolean) {
    if (studioMode) {
      const pageInfo = JSON.parse(window.self.name.replace(new RegExp('^' + iframeNamePrefix), ''));
      this.hostHandlePage = new Page(pageInfo.path, pageInfo.title);
      this.hostHandlePage.loadFromHost = true;
      this.hostHandlePage.hostMetadataPromise = new Promise((resolve) => {
        this.hostHandlePage.hostMetadataResove = resolve;
      })
      window.parent!.postMessage('ok', '*');
      window.addEventListener('message', (event: any) => {
        if (event.data.type === 'refresh') {
          this.hostHandlePage.metadata = event.data.metadata;
          if (!this.hostHandlePage.loadFromHostOver) {
            this.hostHandlePage.hostMetadataResove();
            this.hostHandlePage.loadFromHostOver = true;
          } else {
            this.hostHandlePage.loadModuleFromMetadata();
          }
        }
      })
    }
  }

  static create(data: any): Project {
    const project = new Project(data.name, data.key, data.studioMode);

    /** mock */
    const page1 = new Page('/groot/page1', '');
    // page1.resourceUrl = 'http://192.168.31.37:5000/page1.js';
    project.allPageMap.set('/groot/page1', page1);
    const page2 = new Page('/groot/page2', '');
    // page2.resourceUrl = 'http://192.168.31.37:5000/page2.js';
    project.allPageMap.set('/groot/page2', page2);
    const page3 = new Page('/groot/page3', '');
    // page3.resourceUrl = 'http://192.168.31.37:5000/page3.js';
    project.allPageMap.set('/groot/page3', page3);

    if (data.studioMode) {
      project.allPageMap.set(project.hostHandlePage.path, project.hostHandlePage);
    }

    return project;
  }

  hasPage(path: string): boolean {
    return this.loadedPageMap.has(path);
  }

  getPage(path: string): Page {
    return this.loadedPageMap.get(path)!;
  }

  loadPage(path: string): Promise<Page> {
    const page = this.allPageMap.get(path);

    if (!page) {
      return Promise.reject(new Error('not found page'));
    }

    if (!page.resourceUrl && !instance.worker) {
      this.initWorker();
    }

    return page.loadModule().then(() => {
      this.loadedPageMap.set(path, page);
      return page;
    });
  }

  private initWorker() {
    loadWebWorker();

    instance.worker.addEventListener(
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

export class Page extends EventTarget {
  resourceUrl!: string;
  resolveCallback!: () => void;
  module: any;
  metadata: any;
  compile = false;
  hostMetadataPromise!: Promise<void>;
  metadataPromise!: Promise<void>;
  hostMetadataResove!: () => void;
  loadFromHost = false;
  loadFromHostOver = false;
  private resourcePromise!: Promise<void>;

  constructor(public path: string, public title: string) {
    super();
  }

  loadModule(): Promise<void> {
    if (this.resourceUrl) {
      if (!this.resourcePromise) {
        this.resourcePromise = this.loadModuleFromResource();
      }

      return this.resourcePromise;
    } else {
      if (!this.metadataPromise) {
        this.metadataPromise = this.loadModuleFromMetadata();
      }

      return this.metadataPromise;
    }
  }

  loadModuleFromMetadata(): Promise<void> {
    return new Promise<CodeMetadata>((resolve) => {
      if (this.loadFromHost) {
        if (!this.loadFromHostOver) {
          this.hostMetadataPromise.then(() => {
            resolve(this.metadata);
          })
        } else {
          resolve(this.metadata);
        }
      } else {
        /** todo - 请求页面metadata */
        setTimeout(() => {
          const data: CodeMetadata = {
            moduleName: this.path,
            type: 'page',
            data: null,
          };
          resolve(data);
        }, 1000);
      }
    }).then((metadata) => {
      this.metadata = metadata;
      const messageData: WebWorkerInputMessage = {
        type: 'transformCode',
        metadata,
        path: this.path,
      };

      return new Promise((resolve) => {
        this.resolveCallback = resolve;
        (instance.worker as Worker).postMessage(messageData);
      });
    });
  }

  loadModuleFromResource(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
      fetch(this.resourceUrl)
        .then((res) => res.text())
        .then((code) => {
          this?.execCode(code);
        });
    });
  }

  execCode(code: string): void {
    window._moduleCallback = (module) => {
      this.module = module;
      this.compile = true;
      this.resolveCallback();
      this.dispatchEvent(new Event('refresh'));
    };

    try {
      window.Function(code)();
    } catch (err) {
      errorInfo('page code execute fail ==> ' + err, 'project');
    }
  }
}
