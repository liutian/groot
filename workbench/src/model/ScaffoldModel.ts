import { serverPath } from "config";
import WorkbenchModel from "./WorkbenchModel";

export default class ScaffoldModel {
  static modelName = 'scaffold';

  public loadComponent: 'doing' | 'notfound' | 'over' = 'doing';
  public scaffold: Scaffold;
  private workbench: WorkbenchModel;

  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public switchComponent = (componentId: number, versionId?: number) => {
    const url = `${serverPath}/component/prototype/detail/${componentId}?versionId=${versionId}`;
    this.loadComponent = 'doing';
    fetch(url).then(res => res.json()).then(({ data }: { data: Component }) => {
      this.loadComponent = 'over';
      this.workbench.start(data, true);
      this.workbench.navigation(this.workbench.playgroundPath);
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
}