import { APIPath, BaseModel, Component, ComponentVersion, ModalStatus } from "@grootio/common";
import { getContext, grootManager } from "context";

export default class SolutionModel extends BaseModel {
  static modelName = 'SolutionModel';

  componentAddModalStatus: ModalStatus = ModalStatus.None
  componentVersionAddModalStatus: ModalStatus = ModalStatus.None
  componentList: Component[] = [];
  component: Component

  public addComponent(rawComponent: Component) {
    this.componentAddModalStatus = ModalStatus.Submit;
    getContext().request(APIPath.component_add, {
      ...rawComponent,
      solutionId: getContext().groot.params.solution.id,
    }).then(({ data }) => {
      this.componentAddModalStatus = ModalStatus.None;
      this.componentList.push(data)
      grootManager.command.executeCommand('gc.fetch.prototype', data.id, data.recentVersionId)
    });
  }

  public loadList() {
    getContext().request(APIPath.solution_componentList_SolutionId, { solutionId: 1, all: '1' }).then(({ data }) => {
      this.componentList = data;
    })
  }

  public addComponentVersion = (rawComponentVersion: ComponentVersion) => {
    this.componentVersionAddModalStatus = ModalStatus.Submit;
    getContext().request(APIPath.componentVersion_add, rawComponentVersion).then(({ data }) => {
      this.componentVersionAddModalStatus = ModalStatus.None;
      this.component.versionList.push(data);
      this.component.componentVersion = data;

      grootManager.command.executeCommand('gc.fetch.prototype', this.component.id, data.id)
    });
  }

  public publish = (component: Component) => {
    const componentId = component.id
    const versioinId = component.componentVersionId
    getContext().request(APIPath.componentVersion_publish, { componentId, versioinId }).then(() => {
      this.component.recentVersionId = versioinId;
    });
  }
}