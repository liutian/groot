import { CodeMetadata } from "@grootio/core";
import { UIManagerInstance, WebWorkerInputMessage } from "./types";
import { errorInfo, studioMode } from "./util";

export class Page extends EventTarget {
  /**
   * 代码地址
   */
  resourceUrl?: string;
  /**
   * 页面模块
   */
  module?: any;
  /**
   * 页面代码元数据
   */
  metadata?: CodeMetadata;
  /**
   * 页面加载完成的回调函数
   */
  private resolveCallbackForLoad!: () => void;
  private resolveCallbackForWorker?: () => void;
  /**
   * 通过url加载页面代码的回调
   */
  private resourcePromise!: Promise<void>;
  /**
   * 通过元数据加载页面代码的回调
   */
  private metadataPromise!: Promise<void>;
  hostMetadataPromise!: Promise<CodeMetadata>;
  loadFromHostFirst = false;
  transformQueue: WebWorkerInputMessage[] = [];

  constructor(public name: string, public path: string, private manager: UIManagerInstance) {
    super();
  }

  /**
   * 加载页面模块代码，确保只执行一次
   * @returns 加载完成的Promise
   */
  loadModule(): Promise<void> {
    // 从远程地址加载已经编译好的可执行的页面代码
    if (this.resourceUrl) {
      if (!this.resourcePromise) {
        this.resourcePromise = this.loadModuleFromResource();
      }

      return this.resourcePromise;
    } else {
      // 通过元数据生成代码
      if (!this.metadataPromise) {
        this.metadataPromise = this.createModuleFromMetadata();
      }

      return this.metadataPromise;
    }
  }

  /**
   * 通过元数据生成模块代码
   */
  createModuleFromMetadata(): Promise<void> {
    return new Promise<CodeMetadata>((resolve) => {
      // 如果是工作台模式，从父级窗口获取元数据
      if (studioMode) {
        if (!this.loadFromHostFirst) {
          this.hostMetadataPromise.then((metadata) => {
            resolve(metadata);
          })
        } else {
          resolve(this.metadata!);
        }
      } else {
        resolve(this.metadata!);
      }
    }).then((metadata) => {
      this.metadata = metadata;
      const messageData: WebWorkerInputMessage = {
        type: 'transformCode',
        metadata,
        path: this.path,
      };
      this.postMessageByQueue(messageData);

      return new Promise((resolve) => {
        this.resolveCallbackForLoad = resolve;
      });
    });
  }

  createModuleByWorker(metadata: CodeMetadata): Promise<void> {
    this.metadata = metadata;
    const messageData: WebWorkerInputMessage = {
      type: 'transformCode',
      metadata,
      path: this.path,
    };
    this.postMessageByQueue(messageData);

    return new Promise((resolve) => {
      this.resolveCallbackForWorker = resolve;
    });
  }

  /**
   * 通过url加载编译好的页面代码
   */
  loadModuleFromResource(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveCallbackForLoad = resolve;
      fetch(this.resourceUrl!)
        .then((res) => res.text())
        .then((code) => {
          this.execCode(code);
        });
    });
  }

  /**
   * 执行页面代码
   */
  execCode(code: string): void {
    window._moduleCallback = (module) => {
      this.module = module;
      this.resolveCallbackForLoad();
      if (this.resolveCallbackForWorker) {
        this.resolveCallbackForWorker();
      }
      // 触发强制刷新UI的事件
      this.dispatchEvent(new Event('refresh'));
    };

    try {
      window.Function(code)();
    } catch (err) {
      errorInfo('page code execute fail ==> ' + err, 'application');
    } finally {
      this.postMessageByQueue();
    }
  }

  // 防止热更新触发频率高导致转移任务无法迅速完成
  private postMessageByQueue(message?: WebWorkerInputMessage) {
    if (message) {
      if (this.transformQueue.length === 0) {
        (this.manager.worker as Worker).postMessage(message);
      } else {
        this.transformQueue.push(message);
      }
    } else {
      if (this.transformQueue.length) {
        (this.manager.worker as Worker).postMessage(this.transformQueue.shift());
      }
    }
  }
}