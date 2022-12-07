import { Metadata, ViewData, PostMessageType } from "@grootio/common";

import { buildComponent, reBuildComponent } from "./compiler";
import { appControlMode } from "./config";

export class View {
  readonly key: string;
  readonly controlMode: boolean;
  rootComponent?: any;
  status: 'loading' | 'finish';
  private metadataUrl: string;
  private metadataList: Metadata[];
  private metadataPromise?: Promise<Metadata[]>;
  private fetchMetadataResolve?: (data: Metadata[]) => void;

  constructor(data: ViewData, controlMode: boolean) {
    this.key = data.key;
    this.metadataUrl = data.metadataUrl;
    this.metadataList = data.metadataList;
    this.controlMode = controlMode;

    if (!appControlMode && !this.metadataUrl && (!Array.isArray(this.metadataList) || this.metadataList.length === 0)) {
      throw new Error('metadataUrl 和 metadataList 不能同时为空');
    }
  }

  public init(): Promise<View> {
    return this.loadMetadata().then((metadataList) => {
      this.metadataList = metadataList;
      const rootMetadata = this.metadataList.find(m => !m.parentId);
      this.rootComponent = buildComponent(rootMetadata, this.metadataList, true);
      this.status = 'finish';
      return this;
    })
  }

  public update(data: Metadata | Metadata[]) {
    const multi = Array.isArray(data);
    if (this.status === 'finish') {
      if (multi) {
        this.fullUpdate(data);
      } else {
        this.incrementUpdate(data)
      }
    } else {
      this.fetchMetadataResolve(multi ? data : [data]);
    }
  }

  /**
   * 加载页面配置信息
   */
  private loadMetadata(): Promise<Metadata[]> {
    if (this.status !== 'finish') {
      this.status = 'loading';
    }

    if (appControlMode && this.controlMode) {
      window.parent.postMessage({ type: PostMessageType.InnerFetchView, data: this.key }, '*');
      if (!this.metadataPromise) {
        this.metadataPromise = new Promise((resolve) => {
          this.fetchMetadataResolve = (metadataList: Metadata[]) => {
            resolve(metadataList);
          }
        })
      }

      return this.metadataPromise;
    } else if (this.metadataList) {
      return Promise.resolve(this.metadataList);
    } else if (this.metadataUrl) {// 从远程地址加载配置信息
      if (!this.metadataPromise) {
        this.metadataPromise = fetch(this.metadataUrl).then((res) => res.json())
      }

      return this.metadataPromise;
    } else {
      return Promise.reject('metadataUrl and metadata can not both be empty');
    }
  }

  private incrementUpdate(data: Metadata) {
    const metadata = this.metadataList.find(m => m.id === data.id);
    metadata.propsObj = data.propsObj;
    metadata.advancedProps = data.advancedProps;
    reBuildComponent(metadata, this.metadataList);
  }

  private fullUpdate(list: Metadata[]) {
    const rootMetadata = this.metadataList.find(m => !m.parentId);
    const newRootIndex = list.findIndex(item => !item.parentId);
    const newRootMetadata = list[newRootIndex];

    rootMetadata.propsObj = newRootMetadata.propsObj;
    rootMetadata.advancedProps = newRootMetadata.advancedProps;
    list.splice(newRootIndex, 1, rootMetadata);
    this.metadataList = list;

    reBuildComponent(rootMetadata, this.metadataList);
  }
}