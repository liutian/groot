import { Component, ComponentInstance, ComponentVersion } from "./entities";

export type ModelClass<T> = (new () => T) & { modelName: string };

export type ModelTuple<T> = [T, (fun: Function, execTrigger?: boolean) => void];

export type UseModelFnType = <T>(model: ModelClass<T>, isRoot?: boolean) => ModelTuple<T>;

export class WorkbenchModelType extends EventTarget {
  static modelName: string;
  prototypeMode: boolean;
  component: Component;
  componentInstance: ComponentInstance;
  instanceList: ComponentInstance[] = [];
  componentVersion: ComponentVersion;
}

export type PluginViewComponent = React.FC<{
  useModel: UseModelFnType,
  WorkbenchModel: ((new () => WorkbenchModelType) & { modelName: string })
}>;