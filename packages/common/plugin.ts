import { APIStore } from "./api/API.store";
import { Component, ComponentInstance, ComponentVersion, State } from "./entities";
import { RequestFnType } from "./internal";

export type ModelClass<T> = (new () => T) & { modelName: string };

export type UseModelFnType = <T>(model: ModelClass<T>, isRoot?: boolean) => T;

export class WorkbenchModelType extends EventTarget {
  static modelName: string;
  prototypeMode: boolean;
  component: Component;
  componentInstance: ComponentInstance;
  instanceList: ComponentInstance[] = [];
  componentVersion: ComponentVersion;
  stateList: State[]
}

export class InstanceModelType {

}

export type PluginViewComponent = React.FC<{
  useModel: UseModelFnType,
  request: RequestFnType<APIStore>,
  WorkbenchModel: ((new () => WorkbenchModelType) & { modelName: string }),
  InstanceModel: ((new () => InstanceModelType) & { modelName: string })
}>;