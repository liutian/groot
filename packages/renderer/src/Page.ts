import { Metadata, PageData } from "@grootio/types";
import { buildComponent, reBuildProps } from "./compiler";
import { errorInfo } from "./util";

export class Page extends EventTarget {
  path!: string;
  metadataUrl: string;
  metadataList: Metadata[];

  metadataPromise?: Promise<Metadata[]>;
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
    if (this.metadataList) {
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
    const rootMetadata = this.metadataList.find(m => m.parentId === null);
    this.rootComponent = buildComponent(rootMetadata, this.metadataList);
  }

  incrementUpdate(newMetadata: Metadata) {
    const metadata = this.metadataList.find(m => m.id === newMetadata.id);
    if (metadata) {
      metadata.propsObj = newMetadata.propsObj;
      metadata.advancedProps = newMetadata.advancedProps;
      reBuildProps(metadata, this.metadataList);
      metadata.refresh();
    }
  }
}