import { APIPath, ComponentInstance, Deploy, EnvType, ModalStatus, Release } from "@grootio/common";
import { getContext, grootCommandManager, grootStateManager } from "context";

export default class ApplicationModel {
  static modelName = 'ApplicationModel';
  emitter: Function;

  instanceAddModalStatus: ModalStatus = ModalStatus.None
  releaseAddModalStatus: ModalStatus = ModalStatus.None
  assetBuildModalStatus: ModalStatus = ModalStatus.None
  assetDeployModalStatus: ModalStatus = ModalStatus.None
  assetBuildStatus: 'init' | 'analyseOver' | 'building' | 'buildOver' | 'approve' = 'init';
  entryInstanceList: ComponentInstance[] = [];
  noEntryInstanceList: ComponentInstance[] = [];
  releaseList: Release[] = [];
  deployBundleId: number

  instanceAddEntry = true

  public loadReleaseList() {
    const applicationId = getContext().groot.params.application.id
    getContext().request(APIPath.application_releaseList_applicationId, { applicationId }).then(({ data }) => {
      this.releaseList = data;
    })
  }

  public loadList(releaseId: number) {
    return getContext().request(APIPath.release_instanceList_releaseId, { releaseId }).then(({ data }) => {
      this.entryInstanceList.length = 0;
      this.noEntryInstanceList.length = 0

      data.forEach((item) => {
        if (item.entry) {
          this.entryInstanceList.push(item)
        } else {
          this.noEntryInstanceList.push(item);
        }
      })
    })
  }

  public addRootInstance(rawComponentInstance: ComponentInstance) {
    this.instanceAddModalStatus = ModalStatus.Submit;
    if (this.instanceAddEntry) {
      rawComponentInstance.wrapper = 'groot/PageContainer';
    } else {
      rawComponentInstance.wrapper = 'groot/Container';
    }

    const releaseId = grootStateManager().getState('gs.release').id
    return getContext().request(APIPath.componentInstance_addRoot, {
      ...rawComponentInstance,
      entry: this.instanceAddEntry,
      releaseId
    }).then(({ data }) => {
      if (this.instanceAddEntry) {
        this.entryInstanceList.push(data)
      } else {
        this.noEntryInstanceList.push(data)
      }

      grootCommandManager().executeCommand('gc.fetch.instance', data.id)
    }).finally(() => {
      this.instanceAddModalStatus = ModalStatus.None;
    })
  }


  public addRelease(rawRelease: Release) {
    this.releaseAddModalStatus = ModalStatus.Submit;
    return getContext().request(APIPath.release_add, rawRelease).then(({ data }) => {
      this.releaseList.push(data);

      const currInstance = grootStateManager().getState('gs.componentInstance')
      const rootInstanceId = currInstance.rootId || currInstance.id

      return this.switchRelease(data.id, rootInstanceId);
    }).finally(() => {
      this.releaseAddModalStatus = ModalStatus.None;
    })
  }


  public switchRelease(releaseId: number, trackId?: number) {
    this.loadList(releaseId).then(() => {
      if (trackId) {
        getContext().request(APIPath.componentInstance_reverseDetectId, { releaseId, trackId }).then(({ data }) => {
          if (data) {
            grootCommandManager().executeCommand('gc.fetch.instance', data)
          } else {
            const firstInstance = this.entryInstanceList[0]
            grootCommandManager().executeCommand('gc.fetch.instance', firstInstance.id)
          }
        })
      } else {
        const firstInstance = this.entryInstanceList[0]
        grootCommandManager().executeCommand('gc.fetch.instance', firstInstance.id)
      }
    })
  }


  public assetBuild() {
    this.assetBuildStatus = 'building';
    const releaseId = grootStateManager().getState('gs.release').id
    getContext().request(APIPath.asset_build, { releaseId }).then(({ data }) => {
      this.assetBuildStatus = 'buildOver';
      this.deployBundleId = data;
    })
  }

  public assetDeploy(formData: Deploy) {
    this.assetDeployModalStatus = ModalStatus.Submit;
    getContext().request(APIPath.asset_deploy, { bundleId: this.deployBundleId, ...formData }).then(() => {
      this.assetDeployModalStatus = ModalStatus.None;
    })
  }
}