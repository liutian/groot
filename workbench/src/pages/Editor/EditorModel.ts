import { metadataFactory, propTreeFactory } from "@grootio/core";
import { ModalStatus } from "@util/common";
import { APIPath } from "api/API.path";
import request from "@util/request";
import WorkbenchModel from "../../model/WorkbenchModel";

export default class EditorModel {
  static modelName = 'editor';

  public loadStatus: 'doing' | 'no-component' | 'no-application' | 'ok' = 'doing';
  public pageAddModalStatus: ModalStatus = ModalStatus.None;
  public releaseAddModalStatus: ModalStatus = ModalStatus.None;
  public assetBuildModalStatus: ModalStatus = ModalStatus.None;
  public assetDeployModalStatus: ModalStatus = ModalStatus.None;
  public assetBuildStatus: 'init' | 'analyseOver' | 'building' | 'buildOver' | 'approve' = 'init';
  public deployBundleId: number;
  public currPageInstance: ComponentInstance;
  public breadcrumbList: { id: number, name: string }[] = [];

  private workbench: WorkbenchModel;
  private instanceList: ComponentInstance[] = [];


  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public switchComponentInstance = (instanceId: number, changeHistory: boolean, breadcrumbAppend: boolean) => {
    const instance = this.instanceList.find(i => i.id === instanceId);
    this.workbench.componentInstance = instance;
    this.workbench.component = instance.component;

    if (breadcrumbAppend) {
      this.breadcrumbList.push({ id: instanceId, name: instance.name })
    } else {
      const length = this.breadcrumbList.findIndex(item => item.id === instanceId);
      this.breadcrumbList.length = length === -1 ? 0 : length;
      this.breadcrumbList.push({ id: instanceId, name: instance.name });
    }

    if (changeHistory) {
      this.workbench.currActiveTab = 'props';
      window.history.pushState(null, '', `?applicationId=${this.workbench.application.id}&releaseId=${this.workbench.application.release.id}&instanceId=${instanceId}`);
    }
  }

  public fetchPage = (instanceId: number, changeHistory = true) => {
    return request(APIPath.componentInstance_pageDetail, { instanceId }).then(({ data: { children, root } }) => {
      this.loadStatus = 'ok';

      this.breadcrumbList.length = 0;
      this.breadcrumbList.push({ id: instanceId, name: root.name });

      this.instanceList = [root, ...children];
      const metadataList = children.map((instance) => {
        const { groupList, blockList, itemList } = instance.componentVersion;
        const valueList = instance.valueList;
        const rootGroupList = propTreeFactory(groupList, blockList, itemList, valueList);
        const metadata = metadataFactory(rootGroupList, instance.component, instance.id);
        return metadata;
      })

      this.workbench.startPage(root, metadataList, changeHistory);
    });
  }

  public fetchApplication = (applicationId: number, releaseId?: number) => {
    return request(APIPath.application_detail, { applicationId, releaseId }).then(({ data }) => {
      this.workbench.startApplication(data);
    }).catch((e) => {
      this.loadStatus = 'no-application';
      return Promise.reject(e);
    })
  }

  public addPage = (rawComponentInstance: ComponentInstance) => {
    this.pageAddModalStatus = ModalStatus.Submit;
    return request(APIPath.componentInstance_add, {
      ...rawComponentInstance,
      releaseId: this.workbench.application.release.id
    }).then(({ data }) => {
      this.pageAddModalStatus = ModalStatus.None;
      this.workbench.application.release.instanceList.push(data);

      return this.fetchPage(data.id);
    });
  }

  public addRelease = (rawRelease: Release) => {
    this.releaseAddModalStatus = ModalStatus.Submit;
    return request(APIPath.release_add, rawRelease).then(({ data }) => {
      this.releaseAddModalStatus = ModalStatus.None
      this.workbench.application.release = data;
      this.workbench.application.releaseList.push(data);

      const currInstance = this.workbench.componentInstance;
      return this.switchReleaseByTrackId(data.id, currInstance.trackId);
    });
  }

  public switchRelease = (releaseId: number) => {
    request(APIPath.release_detail, { releaseId }).then(({ data }) => {
      this.workbench.application.release = data;

      const currInstance = this.workbench.componentInstance;
      return this.switchReleaseByTrackId(data.id, currInstance.trackId);
    });
  }

  private switchReleaseByTrackId = (releaseId: number, trackId: number) => {
    return request(APIPath.componentInstance_detailId, { releaseId, trackId }).then(({ data }) => {
      if (data) {
        return this.switchComponentInstance(data, true, false);
      } else if (this.workbench.application.release.instanceList.length) {
        const instance = this.workbench.application.release.instanceList[0];
        return this.switchComponentInstance(instance.id, true, false);
      } else {
        return Promise.resolve();
      }
    })
  }

  public assetBuild = () => {
    this.assetBuildStatus = 'building';
    return request(APIPath.asset_build, { releaseId: this.workbench.application.release.id }).then(({ data }) => {
      this.assetBuildStatus = 'buildOver';
      this.deployBundleId = data;
    })
  }

  public assetDeploy = (formData: any) => {
    this.assetDeployModalStatus = ModalStatus.Submit;
    return request(APIPath.asset_deploy, { bundleId: this.deployBundleId, ...formData }).then(() => {
      this.assetDeployModalStatus = ModalStatus.None;
    })
  }
}