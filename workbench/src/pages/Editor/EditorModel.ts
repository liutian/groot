import { serverPath } from "config";
import WorkbenchModel from "../../model/WorkbenchModel";

export default class EditorModel {
  static modelName = 'editor';

  public loadComponent: 'doing' | 'notfound' | 'over' = 'doing';
  public application: Application;
  private workbench: WorkbenchModel;

  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public switchComponent = (componentId: number, releaseId?: number) => {
    const url = `${serverPath}/component/instance/detail/${componentId}?releaseId=${releaseId}`;
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
      this.switchComponent(this.workbench.componentInstance.componentId, data.release.id);
    }).catch((e) => {
      this.application = null;
    })
  }
}