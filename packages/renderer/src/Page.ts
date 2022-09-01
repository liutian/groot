import { Metadata, PageData, PostMessageType } from "@grootio/common";
import { buildComponent, reBuildProps } from "./compiler";
import { controlMode, errorInfo } from "./util";
import { instance } from './application';
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

    if (!this.metadataUrl && !this.metadataList) {
      errorInfo('metadataUrl and metadataList can not both be empty');
    }
  }

  /**
   * 加载页面配置信息
   */
  loadMetadata(): Promise<Metadata[]> {
    if (controlMode && this.controlMode) {
      window.parent.postMessage({ type: PostMessageType.Fetch_Page, data: this.path }, '*',);
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
      reBuildProps(metadata, this.metadataList);
      const refresh = instance.getRefresh(metadata);
      refresh();
    }
  }
}