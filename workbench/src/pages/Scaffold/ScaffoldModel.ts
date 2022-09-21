import { ModalStatus } from "@util/common";
import { APIPath } from "api/API.path";
import request from "@util/request";
import WorkbenchModel from "../../model/WorkbenchModel";

export default class ScaffoldModel {
  static modelName = 'scaffold';

  public loadStatus: 'doing' | 'notfound' | 'ok' = 'doing';
  public componentAddModalStatus: ModalStatus = ModalStatus.None;
  public componentVersionAddModalStatus: ModalStatus = ModalStatus.None;
  private workbench: WorkbenchModel;

  public inject(workbench: WorkbenchModel) {
    this.workbench = workbench;
  }

  public switchComponent = (componentId: number, versionId: number) => {
    return request(APIPath.componentPrototype_detail, { componentId, versionId }).then(({ data }) => {
      this.loadStatus = 'ok';
      this.workbench.startComponent(data);
    })
  }

  public fetchScaffold = (scaffoldId: number) => {
    return request(APIPath.scaffold_detail, { scaffoldId }).then(({ data }) => {
      this.workbench.startScaffold(data);
    }).catch((e) => {
      return Promise.reject(e);
    })
  }

  public addComponent = (rawComponent: Component) => {
    this.componentAddModalStatus = ModalStatus.Submit;
    return request(APIPath.component_add, {
      ...rawComponent,
      scaffoldId: this.workbench.scaffold.id
    }).then(({ data }) => {
      this.componentAddModalStatus = ModalStatus.None;
      this.workbench.scaffold.componentList.push(data);

      this.switchComponent(data.id, data.recentVersionId);
    });
  }

  public addComponentVersion = (rawComponentVersion: ComponentVersion) => {
    this.componentVersionAddModalStatus = ModalStatus.Submit;
    return request(APIPath.componentVersion_add, rawComponentVersion).then(({ data }) => {
      this.componentVersionAddModalStatus = ModalStatus.None;
      this.workbench.component.versionList.push(data);

      this.switchComponent(this.workbench.component.id, data.id);
    });
  }

  public publish = (componentId: number, versioinId: number) => {
    request(APIPath.componentVersion_publish, { componentId, versioinId }).then(() => {
      this.workbench.component.recentVersionId = versioinId;
    });
  }
}