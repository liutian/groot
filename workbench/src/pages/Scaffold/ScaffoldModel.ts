import { serverPath } from "config";
import WorkbenchModel from "../../model/WorkbenchModel";

export default class ScaffoldModel {
  static modelName = 'scaffold';

  public scaffold: Scaffold;
  public loadComponent: 'doing' | 'notfound' | 'over' = 'doing';
  public componentAddFetchLoading = false;
  public componentVersionAddFetchLoading = false;
  public showComponentAddModal = false;
  public showComponentVersionAddModal = false;
  private workbench: WorkbenchModel;

  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public switchComponent = (componentId: number, versionId: number) => {
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
    }).catch((e) => {
      this.scaffold = null;
      return Promise.reject(e);
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

      this.workbench.currActiveTab = 'props';
      this.switchComponent(newComponent.id, newComponent.recentVersionId);
      window.history.pushState(null, '', `?scaffoldId=${this.scaffold.id}&versionId=${newComponent.recentVersionId}&componentId=${newComponent.id}`);
    });
  }

  public addComponentVersion = (rawComponentVersion: ComponentVersion) => {
    this.componentVersionAddFetchLoading = true;
    return fetch(`${serverPath}/component-version/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...rawComponentVersion,
      })
    }).then(res => res.json()).then(({ data: newComponentVersion }: { data: ComponentVersion }) => {
      this.componentVersionAddFetchLoading = false;
      this.showComponentVersionAddModal = false;
      this.workbench.component.versionList.push(newComponentVersion);
      this.switchComponent(this.workbench.component.id, newComponentVersion.id);
    });
  }

  public publish = (componentId: number, versioinId: number) => {
    fetch(`${serverPath}/component-version/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        componentId,
        versioinId
      })
    }).then(res => res.json()).then(() => {
      this.workbench.component.recentVersionId = versioinId;
    });
  }
}