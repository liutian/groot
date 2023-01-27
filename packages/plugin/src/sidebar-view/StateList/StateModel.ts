import { State, WorkbenchModelType } from "@grootio/common";

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

}