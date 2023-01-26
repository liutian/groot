import { Component, ComponentInstance, ComponentVersion, State } from "./entities";
import { StateType } from "./internal";

export type ModelClass<T> = (new () => T) & { modelName: string };

export type UseModelFnType = <T>(model: ModelClass<T>, isRoot?: boolean) => T;

// 公开WorkbenchModel类型必须单独定义，不能直接通过ts import(...) ，该语法会导致ts深入解析 workbench项目中 WorkbenchModel 其他依赖项导致重复甚至循环解析
export class WorkbenchModelType extends EventTarget {
  static readonly modelName = 'groot_workbench';
  prototypeMode: boolean;
  component: Component;
  componentInstance: ComponentInstance;
  instanceList: ComponentInstance[] = [];
  componentVersion: ComponentVersion;
  globalStateList: State[];
  pageStateList: State[]
}


export type PluginViewComponent = React.FC<{
}>;

export enum ModalStatus {
  None = 'none',
  Init = 'init',
  Submit = 'submit'
}

export const StateTypeMap = [
  { name: '字符串', key: StateType.Str },
  { name: '数字', key: StateType.Num },
  { name: '布尔', key: StateType.Bool },
  { name: '对象', key: StateType.Obj },
  { name: '数组', key: StateType.Arr },
];