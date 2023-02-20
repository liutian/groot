import { APIPath, Component, ModalStatus } from "@grootio/common";
import { getContext, grootCommandManager, grootStateManager } from "context";

export default class SolutionModel {
  static modelName = 'SolutionModel';
  emitter: Function;

  componentAddModalStatus: ModalStatus = ModalStatus.None
  componentList = [];

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

  public getMenuList
}