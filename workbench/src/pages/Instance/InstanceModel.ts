import { ModalStatus } from "@util/common";
import { APIPath } from "api/API.path";
import request from "@util/request";
import WorkbenchModel from "../../model/WorkbenchModel";
import { ComponentInstance, Deploy, EnvType, Release } from "@grootio/common";

export default class InstanceModel {
  static modelName = 'editor';

  public loadStatus: 'doing' | 'fetch-plugin' | 'no-component' | 'no-application' | 'ok' = 'doing';
  public instanceAddModalStatus: ModalStatus = ModalStatus.None;
  public instanceAddEntry = true;
  public releaseAddModalStatus: ModalStatus = ModalStatus.None;
  public assetBuildModalStatus: ModalStatus = ModalStatus.None;
  public assetDeployModalStatus: ModalStatus = ModalStatus.None;
  public assetBuildStatus: 'init' | 'analyseOver' | 'building' | 'buildOver' | 'approve' = 'init';
  public deployBundleId: number;
  public currPageInstance: ComponentInstance;
  public breadcrumbList: { id: number, name: string }[] = [];
  public currRootInstanceId: number;

  private workbench: WorkbenchModel;

  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public fetchApplication = (applicationId: number, releaseId?: number) => {
    return request(APIPath.application_detail, { applicationId, releaseId }).then(({ data }) => {
      this.workbench.launchInstanceBox(data);
      this.loadStatus = 'fetch-plugin';
    }).catch((e) => {
      this.loadStatus = 'no-application';
      return Promise.reject(e);
    })
  }

  public fetchRootInstance = (rootInstanceId: number) => {
    this.currRootInstanceId = rootInstanceId;
    return request(APIPath.componentInstance_rootDetail, { instanceId: rootInstanceId }).then(({ data: { children, root } }) => {
      this.loadStatus = 'ok';

      this.breadcrumbList.length = 0;
      this.breadcrumbList.push({ id: rootInstanceId, name: root.name });

      this.workbench.startComponentInstance(root, children);
    });
  }

  public switchComponentInstance = (instanceId: number) => {
    if (this.workbench.componentInstance.id === instanceId) {
      return;
    }

    const instance = this.workbench.instanceList.find(i => i.id === instanceId);
    this.workbench.changeComponentInstance(instance);
    this.breadcrumbList.length = 0;

    let ctxInstance = instance;
    do {
      this.breadcrumbList.push({ id: ctxInstance.id, name: ctxInstance.name });
      ctxInstance = this.workbench.instanceList.find((item) => item.id === ctxInstance.parentId);
    } while (ctxInstance);
    this.breadcrumbList.reverse();
  }

  public addRootInstance = (rawComponentInstance: ComponentInstance) => {
    this.instanceAddModalStatus = ModalStatus.Submit;
    if (this.instanceAddEntry) {
      rawComponentInstance.wrapper = 'groot/PageContainer';
    } else {
      rawComponentInstance.wrapper = 'groot/Container';
    }
    return request(APIPath.componentInstance_addRoot, {
      ...rawComponentInstance,
      entry: this.instanceAddEntry,
      releaseId: this.workbench.application.release.id
    }).then(({ data }) => {
      this.instanceAddModalStatus = ModalStatus.None;
      this.workbench.application.release.instanceList.push(data);

      return this.fetchRootInstance(data.id);
    });
  }

  public addRelease = (rawRelease: Release) => {
    this.releaseAddModalStatus = ModalStatus.Submit;
    return request(APIPath.release_add, rawRelease).then(({ data }) => {
      this.releaseAddModalStatus = ModalStatus.None;
      this.workbench.application.release = data;
      this.workbench.application.releaseList.push(data);

      const currInstance = this.workbench.componentInstance;
      const rootInstance = !currInstance.parentId ? currInstance : this.workbench.instanceList.find(item => item.id === currInstance.rootId);

      return this.switchReleaseByTrackId(data.id, rootInstance.trackId);
    });
  }

  public switchRelease = (releaseId: number) => {
    request(APIPath.release_detail, { releaseId }).then(({ data }) => {
      this.workbench.application.release = data;

      const rootInstance = this.workbench.instanceList.find(item => item.id === this.currRootInstanceId);
      return this.switchReleaseByTrackId(data.id, rootInstance.trackId);
    });
  }

  private switchReleaseByTrackId = (releaseId: number, trackId: number) => {
    return request(APIPath.componentInstance_reverseDetectId, { releaseId, trackId }).then(({ data }) => {
      if (data) {
        return this.fetchRootInstance(data);
      } else if (this.workbench.application.release.instanceList.length) {
        const instance = this.workbench.application.release.instanceList[0];
        return this.fetchRootInstance(instance.id);
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

  public assetDeploy = (formData: Deploy) => {
    this.assetDeployModalStatus = ModalStatus.Submit;
    return request(APIPath.asset_deploy, { bundleId: this.deployBundleId, ...formData }).then(() => {
      this.assetDeployModalStatus = ModalStatus.None;

      if (formData.env === EnvType.Dev) {
        this.workbench.application.devReleaseId = this.workbench.application.release.id;
      } else if (formData.env === EnvType.Qa) {
        this.workbench.application.qaReleaseId = this.workbench.application.release.id;
      } else if (formData.env === EnvType.Pl) {
        this.workbench.application.plReleaseId = this.workbench.application.release.id;
      } else if (formData.env === EnvType.Ol) {
        this.workbench.application.onlineReleaseId = this.workbench.application.release.id;
      }
      this.workbench.application
    })
  }
}