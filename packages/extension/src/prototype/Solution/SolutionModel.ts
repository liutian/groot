import { APIPath, Component, ComponentVersion, ModalStatus } from "@grootio/common";
import { getContext, grootCommandManager, grootStateManager } from "context";

export default class SolutionModel {
  static modelName = 'SolutionModel';
  emitter: Function;

  componentAddModalStatus: ModalStatus = ModalStatus.None
  componentVersionAddModalStatus: ModalStatus = ModalStatus.None
  componentList: Component[] = [];
  component: Component

  public addComponent(rawComponent: Component) {
    this.componentAddModalStatus = ModalStatus.Submit;
    return getContext().request(APIPath.component_add, {
      ...rawComponent,
      orgId: getContext().groot.params.solution.id
    }).then(({ data }) => {
      this.componentAddModalStatus = ModalStatus.None;
      this.componentList.push(data)
      grootCommandManager().executeCommand('gc.fetch.prototype', data.id, data.recentVersionId)
    });
  }

  public loadList() {
    getContext().request(APIPath.solution_component_list).then(({ data }) => {
      this.componentList = data;
    })
  }

  public addComponentVersion = (rawComponentVersion: ComponentVersion) => {
    this.componentVersionAddModalStatus = ModalStatus.Submit;
    return getContext().request(APIPath.componentVersion_add, rawComponentVersion).then(({ data }) => {
      this.componentVersionAddModalStatus = ModalStatus.None;
      this.component.versionList.push(data);
      this.component.componentVersion = data;

      grootCommandManager().executeCommand('gc.fetch.prototype', this.component.id, data.id)
    });
  }

  public publish = (component: Component) => {
    const componentId = component.id
    const versioinId = component.componentVersion.id
    component.componentVersion
    getContext().request(APIPath.componentVersion_publish, { componentId, versioinId }).then(() => {
      this.component.recentVersionId = versioinId;
    });
  }
}