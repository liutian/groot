import { serverPath } from "config";
import WorkbenchModel from "../../model/WorkbenchModel";

export default class EditorModel {
  static modelName = 'editor';

  public loadComponent: 'doing' | 'notfound' | 'over' = 'doing';
  public application: Application;
  public showPageAddModal = false;
  public pageAddFetchLoading = false;
  private workbench: WorkbenchModel;

  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public switchComponent = (instancceId: number, releaseId?: number) => {
    const url = `${serverPath}/component/instance/detail/${instancceId}?releaseId=${releaseId}`;
    this.loadComponent = 'doing';
    fetch(url).then(res => res.json()).then(({ data }: { data: Component }) => {
      this.loadComponent = 'over';
      this.workbench.startApplication(data, this.application);
    })
  }

  public fetchApplication = (applicationId: number) => {
    const url = `${serverPath}/application/detail/${applicationId}`;
    return fetch(url).then(res => res.json()).then(({ data }: { data: Application }) => {
      this.application = data;
      const pageComponentInstance = data.release.instanceList;
      this.workbench.componentInstance = pageComponentInstance[0];
      this.switchComponent(this.workbench.componentInstance.id, data.release.id);
    }).catch((e) => {
      this.application = null;
    })
  }

  public addPage = (rawComponentInstance: ComponentInstance) => {
    this.pageAddFetchLoading = true;
    return fetch(`${serverPath}/page/add`, {
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
}