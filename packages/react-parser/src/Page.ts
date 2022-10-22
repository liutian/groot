import { Metadata, InstanceData, PostMessageType } from "@grootio/common";

import { buildComponent, reBuildComponent } from "./compiler";
import { controlMode, errorInfo } from "./util";
export class Page extends EventTarget {
  path!: string;
  metadataUrl: string;
  metadataList: Metadata[];

  metadataPromise?: Promise<Metadata[]>;
  fetchMetadataResolve?: (data: Metadata[]) => void;
  rootComponent?: any;
  controlMode = false;
  ready = false;

  constructor(data: InstanceData) {
    super();
    this.path = data.key;
    this.metadataUrl = data.metadataUrl;
    this.metadataList = data.metadataList;

    if (!controlMode && !this.metadataUrl && (!Array.isArray(this.metadataList) || this.metadataList.length === 0)) {
      errorInfo('metadataUrl 和 metadataList 不能同时为空');
    }
  }

  /**
   * 加载页面配置信息
   */
  loadMetadata(): Promise<Metadata[]> {
    if (controlMode && this.controlMode) {
      window.parent.postMessage({ type: PostMessageType.InnerFetchPageComponents, data: this.path }, '*',);
      if (!this.metadataPromise) {
        this.metadataPromise = new Promise((resolve) => {
          this.fetchMetadataResolve = (metadataList: Metadata[]) => {
            this.metadataList = metadataList;
            resolve(metadataList);
          }
        })
      }

      return this.metadataPromise;
    } else if (this.metadataList) {
      return Promise.resolve(this.metadataList);
    } else if (this.metadataUrl) {// 从远程地址加载配置信息
      if (!this.metadataPromise) {
        this.metadataPromise = fetch(this.metadataUrl)
          .then((res) => res.json())
          .then((res) => {
            this.metadataList = res;
            return res;
          });
      }

      return this.metadataPromise;
    } else {
      return Promise.reject('metadataUrl and metadata can not both be empty');
    }
  }

  init() {
    const rootMetadata = this.metadataList.find(m => !m.parentId);
    this.rootComponent = buildComponent(rootMetadata, this.metadataList);
    this.ready = true;
  }

  update(data: Metadata | Metadata[]) {
    const isList = Array.isArray(data);
    if (this.ready) {
      if (isList) {
        this.fullUpdate(data);
      } else {
        this.incrementUpdate(data)
      }
    } else {
      this.fetchMetadataResolve(isList ? data : [data]);
    }
  }

  incrementUpdate(data: Metadata) {
    const metadata = this.metadataList.find(m => m.id === data.id);
    metadata.propsObj = data.propsObj;
    metadata.advancedProps = data.advancedProps;
    reBuildComponent(metadata, this.metadataList);
  }

  fullUpdate(list: Metadata[]) {
    const rootMetadata = this.metadataList.find(m => !m.parentId);

    for (let index = 0; index < list.length; index++) {
      const metadata = list[index];
      if (!metadata.parentId) {
        rootMetadata.propsObj = metadata.propsObj;
        rootMetadata.advancedProps = metadata.advancedProps;
        list.splice(index, 1, rootMetadata);
        this.metadataList = list;
        break;
      }
    }

    reBuildComponent(rootMetadata, this.metadataList);
  }
}