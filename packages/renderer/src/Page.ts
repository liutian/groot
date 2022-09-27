import { Metadata, PageData, PostMessageType } from "@grootio/common";

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

  constructor(data: PageData) {
    super();
    this.path = data.path;
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
      window.parent.postMessage({ type: PostMessageType.Inner_Fetch_Page_Components, data: this.path }, '*',);
      return new Promise((resolve) => {
        this.fetchMetadataResolve = (metadataList: Metadata[]) => {
          this.metadataList = metadataList;
          resolve(metadataList);
        }
      })
    } else if (this.metadataList) {
      return Promise.resolve(this.metadataList);
    } else if (this.metadataUrl) {// 从远程地址加载配置信息
      if (!this.metadataPromise) {
        this.metadataPromise = this.loadMetadataByUrl();
      }
      return this.metadataPromise;
    } else {
      return Promise.reject('metadataUrl and metadata can not both be empty');
    }
  }


  /**
   * 通过url加载页面配置信息
   */
  loadMetadataByUrl(): Promise<Metadata[]> {
    return fetch(this.metadataUrl)
      .then((res) => res.json())
      .then((res) => {
        this.metadataList = res;
        return res;
      });
  }

  compile() {
    const rootMetadata = this.metadataList.find(m => !m.parentId);
    this.rootComponent = buildComponent(rootMetadata, this.metadataList);
  }

  incrementUpdate(newMetadata: Metadata) {
    const metadata = this.metadataList.find(m => m.id === newMetadata.id);
    if (metadata) {
      metadata.propsObj = newMetadata.propsObj;
      metadata.advancedProps = newMetadata.advancedProps;
      reBuildComponent(metadata, this.metadataList);
    }
  }
}