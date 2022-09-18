import { metadataFactory, propTreeFactory } from "@grootio/core";
import { ModalStatus } from "@util/common";
import { serverPath } from "config";
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
    const url = `${serverPath}/component-instance/page-detail/${instanceId}`;
    this.loadStatus = 'doing';
    return fetch(url).then(res => res.json()).then(({ data: { children, root } }: { data: { children: ComponentInstance[], root: ComponentInstance } }) => {
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

  public fetchApplication = (applicationId: number, releaseId: number) => {
    const url = `${serverPath}/application/detail/${applicationId}?releaseId=${releaseId}`;
    return fetch(url).then(res => res.json()).then(({ data }: { data: Application }) => {
      this.workbench.startApplication(data);
    }).catch((e) => {
      this.loadStatus = 'no-application';
      return Promise.reject(e);
    })
  }

  public addPage = (rawComponentInstance: ComponentInstance) => {
    this.pageAddModalStatus = ModalStatus.Submit;
    return fetch(`${serverPath}/component-instance/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...rawComponentInstance,
        releaseId: this.workbench.application.release.id
      })
    }).then(res => res.json()).then(({ data: newComponentInstance }: { data: ComponentInstance }) => {
      this.pageAddModalStatus = ModalStatus.None;
      this.workbench.application.release.instanceList.push(newComponentInstance);

      return this.fetchPage(newComponentInstance.id);
    });
  }

  public addRelease = (rawRelease: Release) => {
    this.releaseAddModalStatus = ModalStatus.Submit;
    return fetch(`${serverPath}/release/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...rawRelease,
      })
    }).then(res => res.json()).then(({ data: newRelease }: { data: Release }) => {
      this.releaseAddModalStatus = ModalStatus.None
      this.workbench.application.release = newRelease;
      this.workbench.application.releaseList.push(newRelease);

      const currInstance = this.workbench.componentInstance;
      return this.switchReleaseByTrackId(newRelease.id, currInstance.trackId);
    });
  }

  public switchRelease = (releaseId: number) => {
    fetch(`${serverPath}/release/detail/${releaseId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(res => res.json()).then(({ data: release }: { data: Release }) => {
      this.workbench.application.release = release;

      const currInstance = this.workbench.componentInstance;
      return this.switchReleaseByTrackId(release.id, currInstance.trackId);
    });
  }

  private switchReleaseByTrackId = (releaseId: number, trackId: number) => {
    return fetch(`${serverPath}/component-instance/detail-id?releaseId=${releaseId}&trackId=${trackId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(res => res.json()).then(({ data: instanceId }: { data: number }) => {
      if (instanceId) {
        return this.switchComponentInstance(instanceId, true, false);
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
    return fetch(`${serverPath}/asset/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        releaseId: this.workbench.application.release.id
      })
    }).then(res => res.json()).then(({ data: bundleId }) => {
      this.assetBuildStatus = 'buildOver';
      this.deployBundleId = bundleId;
    })
  }

  public assetDeploy = (formData: any) => {
    this.assetDeployModalStatus = ModalStatus.Submit;
    return fetch(`${serverPath}/asset/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...formData,
        bundleId: this.deployBundleId
      })
    }).then(res => res.json()).then((assetId: number) => {
      this.assetDeployModalStatus = ModalStatus.None;
    })
  }
}