import { serverPath } from "config";
import WorkbenchModel from "../../model/WorkbenchModel";

export default class EditorModel {
  static modelName = 'editor';

  public loadComponent: 'doing' | 'notfound' | 'over' = 'doing';
  public application: Application;
  public showPageAddModal = false;
  public pageAddFetchLoading = false;
  public showReleaseAddModal = false;
  public releaseAddFetchLoading = false;
  private workbench: WorkbenchModel;


  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public switchComponentInstance = (instanceId: number, changeHistory = false) => {
    const url = `${serverPath}/component/instance/detail/${instanceId}`;
    this.loadComponent = 'doing';
    return fetch(url).then(res => res.json()).then(({ data }: { data: Component }) => {
      this.loadComponent = 'over';
      data.version.valueList = data.instance.valueList;
      this.workbench.startApplication(data, this.application);

      if (changeHistory) {
        this.workbench.currActiveTab = 'props';
        window.history.pushState(null, '', `?applicationId=${this.application.id}&releaseId=${this.application.release.id}&instanceId=${instanceId}`);
      }
    })
  }

  public fetchApplication = (applicationId: number, releaseId: number) => {
    const url = `${serverPath}/application/detail/${applicationId}?releaseId=${releaseId}`;
    return fetch(url).then(res => res.json()).then(({ data }: { data: Application }) => {
      this.application = data;
    }).catch((e) => {
      this.application = null;
      return Promise.reject(e);
    })
  }

  public addPage = (rawComponentInstance: ComponentInstance) => {
    this.pageAddFetchLoading = true;
    return fetch(`${serverPath}/component-instance/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...rawComponentInstance,
        releaseId: this.application.release.id
      })
    }).then(res => res.json()).then(({ data: newComponentInstance }: { data: ComponentInstance }) => {
      this.pageAddFetchLoading = false;
      this.showPageAddModal = false;
      this.application.release.instanceList.push(newComponentInstance);

      return this.switchComponentInstance(newComponentInstance.id, true);
    });
  }

  public addRelease = (rawRelease: Release) => {
    this.releaseAddFetchLoading = true;
    return fetch(`${serverPath}/release/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...rawRelease,
      })
    }).then(res => res.json()).then(({ data: newRelease }: { data: Release }) => {
      this.releaseAddFetchLoading = false;
      this.showReleaseAddModal = false;
      this.application.release = newRelease;
      this.application.releaseList.push(newRelease);

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
      this.application.release = release;

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
        return this.switchComponentInstance(instanceId, true);
      } else if (this.application.release.instanceList.length) {
        const instance = this.application.release.instanceList[0];
        return this.switchComponentInstance(instance.id, true);
      } else {
        return Promise.resolve();
      }
    })
  }
}