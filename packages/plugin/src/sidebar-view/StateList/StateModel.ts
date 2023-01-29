import { APIPath, pick, State, WorkbenchModelType } from "@grootio/common";
import { hostContext } from "../../index";

export default class StateModel {
  static modelName = 'state';

  formVisible = false;
  currState: State;
  isGlobalState = false;
  workbenchModel: WorkbenchModelType;

  public inject(workbenchModel: WorkbenchModelType) {
    this.workbenchModel = workbenchModel;
  }

  showForm = (isGlobal: boolean, data?: State) => {
    this.formVisible = true;
    this.isGlobalState = isGlobal;
    this.currState = data;
  }

  hideForm = () => {
    this.formVisible = false;
    this.currState = null;
  }

  addState = (rawState: State) => {
    rawState.releaseId = this.workbenchModel.application.release.id;

    if (!this.isGlobalState) {
      rawState.instanceId = this.workbenchModel.componentInstance.id;
    }
    hostContext.request(APIPath.state_add, rawState).then((res) => {
      if (this.isGlobalState) {
        this.workbenchModel.globalStateList.push(res.data);
      } else {
        this.workbenchModel.pageStateList.push(res.data);
      }
      this.hideForm();
    });
  }

  updateState = (rawState: State) => {
    hostContext.request(APIPath.state_update, { id: this.currState.id, ...rawState }).then((res) => {
      const list = this.isGlobalState ? this.workbenchModel.globalStateList : this.workbenchModel.pageStateList;
      const originState = list.find(item => item.id === this.currState.id);
      Object.assign(originState, pick(res.data, ['type', 'name', 'value']));

      this.hideForm();
    });
  }

  removeState = () => {
    hostContext.request(APIPath.state_remove_stateId, { stateId: this.currState.id }).then(() => {
      const list = this.isGlobalState ? this.workbenchModel.globalStateList : this.workbenchModel.pageStateList;

      const index = list.findIndex((item) => item.id === this.currState.id);
      if (index !== -1) {
        list.splice(index, 1);
      }

      this.hideForm();
    });
  }
}