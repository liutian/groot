import { ModalStatus } from "@util/common";
import { APIPath } from "api/API.path";
import request from "@util/request";
import WorkbenchModel from "../../model/WorkbenchModel";

export default class ScaffoldModel {
  static modelName = 'scaffold';

  public scaffold: Scaffold;
  public loadStatus: 'doing' | 'notfound' | 'ok' = 'doing';
  public componentAddModalStatus: ModalStatus = ModalStatus.None;
  public componentVersionAddModalStatus: ModalStatus = ModalStatus.None;
  private workbench: WorkbenchModel;

  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public switchComponent = (componentId: number, versionId: number, changeHistory = false) => {
    return request(APIPath.componentPrototype_detail, { componentId, versionId }).then(({ data }) => {
      this.loadStatus = 'ok';
      this.workbench.startScaffold(data, this.scaffold);

      if (changeHistory) {
        this.workbench.currActiveTab = 'props';
        window.history.pushState(null, '', `?scaffold=${this.scaffold.id}&version=${versionId}&component=${componentId}`);
      }
    })
  }

  public fetchScaffold = (scaffoldId: number) => {
    return request(APIPath.scaffold_detail, { scaffoldId }).then(({ data }) => {
      this.scaffold = data;
    }).catch((e) => {
      this.scaffold = null;
      return Promise.reject(e);
    })
  }

  public addComponent = (rawComponent: Component) => {
    this.componentAddModalStatus = ModalStatus.Submit;
    return request(APIPath.component_add, {
      ...rawComponent,
      scaffoldId: this.scaffold.id
    }).then(({ data }) => {
      this.componentAddModalStatus = ModalStatus.None;
      this.scaffold.componentList.push(data);

      this.switchComponent(data.id, data.recentVersionId, true);
    });
  }

  public addComponentVersion = (rawComponentVersion: ComponentVersion) => {
    this.componentVersionAddModalStatus = ModalStatus.Submit;
    return request(APIPath.componentVersion_add, rawComponentVersion).then(({ data }) => {
      this.componentVersionAddModalStatus = ModalStatus.None;
      this.workbench.component.versionList.push(data);
      this.switchComponent(this.workbench.component.id, data.id, true);
    });
  }

  public publish = (componentId: number, versioinId: number) => {
    request(APIPath.componentVersion_publish, { componentId, versioinId }).then(() => {
      this.workbench.component.recentVersionId = versioinId;
    });
  }
}