import { serverPath } from "config";
import WorkbenchModel from "../../model/WorkbenchModel";

export default class ScaffoldModel {
  static modelName = 'scaffold';

  public scaffold: Scaffold;
  public loadComponent: 'doing' | 'notfound' | 'over' = 'doing';
  public componentAddFetchLoading = false;
  public showComponentAddModal = false;
  private workbench: WorkbenchModel;

  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public switchComponent = (componentId: number, versionId?: number) => {
    const url = `${serverPath}/component/prototype/detail/${componentId}?versionId=${versionId}`;
    this.loadComponent = 'doing';
    fetch(url).then(res => res.json()).then(({ data }: { data: Component }) => {
      this.loadComponent = 'over';
      this.workbench.startScaffold(data, this.scaffold);
    })
  }

  public fetchScaffold = (scaffoldId: number) => {
    const url = `${serverPath}/scaffold/detail/${scaffoldId}`;
    return fetch(url).then(res => res.json()).then(({ data }: { data: Scaffold }) => {
      this.scaffold = data;
      if (data.componentList.length) {
        const component = data.componentList[0];
        this.switchComponent(component.id, component.recentVersionId);
      }
    }).catch((e) => {
      this.scaffold = null;
    })
  }

  public addComponent = (rawComponent: Component) => {
    this.componentAddFetchLoading = true;
    return fetch(`${serverPath}/component/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...rawComponent,
        scaffoldId: this.scaffold.id
      })
    }).then(res => res.json()).then(({ data: newComponent }: { data: Component }) => {
      this.componentAddFetchLoading = false;
      this.showComponentAddModal = false;
      this.scaffold.componentList.push(newComponent);
    });
  }
}