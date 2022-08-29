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

  public switchComponentInstance = (instanceId: number) => {
    const url = `${serverPath}/component/instance/detail/${instanceId}`;
    this.loadComponent = 'doing';
    fetch(url).then(res => res.json()).then(({ data }: { data: Component }) => {
      this.loadComponent = 'over';
      data.version.valueList = data.instance.valueList;
      this.workbench.startApplication(data, this.application);
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

      if (newRelease.instanceList.length) {
        const instance = newRelease.instanceList[0];
        this.switchComponentInstance(instance.id);
      }
    });
  }

  public switchRelease = (releaseId: number) => {
    fetch(`${serverPath}/release/detail/${releaseId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(res => res.json()).then(({ data: release }: { data: Release }) => {
      this.application.release = release;
      if (release.instanceList.length) {
        const instance = release.instanceList[0];
        this.switchComponentInstance(instance.id);
      }
    });
  }
}