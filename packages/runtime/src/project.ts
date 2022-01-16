import { CodeMetadata } from '@groot/core';
import { instance, loadWebWorker } from './config';
import { InputMessage, OutputMessage } from './types';
import { errorInfo } from './util';

export class Project {
  private allPageMap = new Map<string, Page>();
  private loadedPageMap = new Map<string, Page>();

  private constructor(public name: string, public key: string) { }

  static create(data: any): Project {
    const project = new Project(data.name, data.key);

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
      ({ data: { type, code, path } }: { data: OutputMessage }) => {
        if (type === 'emitCode') {
          const page = this.allPageMap.get(path);
          page?.execCode(code);
        }
      }
    );
  }
}

export class Page {
  resourceUrl!: string;
  resolveCallback!: () => void;
  module: any;
  metadata: any;
  private metadataPromise!: Promise<void>;
  private resourcePromise!: Promise<void>;

  constructor(public path: string, public title: string) { }

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
      /** todo - 请求页面metadata */
      setTimeout(() => {
        const data: CodeMetadata = {
          moduleName: this.path,
          type: 'page',
          data: null,
        };
        resolve(data);
      }, 1000);
    }).then((metadata) => {
      this.metadata = metadata;
      const messageData: InputMessage = {
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
      this.resolveCallback();
    };

    try {
      window.Function(code)();
    } catch (err) {
      errorInfo('page code execute fail ==> ' + err, 'project');
    }
  }
}
