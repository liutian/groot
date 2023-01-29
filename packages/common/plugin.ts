import { ReactElement } from "react";
import { Application, ComponentInstance, State } from "./entities";
import { RequestFnType, ViewportMode } from "./internal";

export type ModelClass<T> = (new () => T) & { modelName: string };

export type UseModelFnType = <T>(model: ModelClass<T>, isRoot?: boolean) => T;

// 公开WorkbenchModel类型必须单独定义，不能直接通过ts import(...) ，该语法会导致ts深入解析 workbench项目中 WorkbenchModel 其他依赖项导致重复甚至循环解析
export class WorkbenchModelType extends EventTarget {
  static readonly modelName = 'groot_workbench';
  prototypeMode: boolean;
  application: Application;
  componentInstance: ComponentInstance;
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

export type MainType = (context: PluginContext, config: HostConfig) => HostConfig;

export type PluginContext = {
  request: RequestFnType<any>,
  workbenchModel: WorkbenchModelType
}

export enum WorkbenchEvent {
  LaunchFinish = 'launch_finish',

  DragComponentStart = 'drag_component_start',
  DragComponentEnd = 'drag_component_end',
}

export type HostConfig = {
  viewportMode?: ViewportMode,
  contributes: {
    sidebarView?: SidebarViewType[],
    propSettingView?: RemotePlugin[]
  }
}

export type SidebarViewType = {
  key: string,
  title: string,
  order?: number,
} & ({
  icon: ReactElement,
  view: ReactElement
} | {
  icon: string,
  view: RemotePlugin
})

export type RemotePlugin = {
  key?: string,
  package: string,
  title: string,
  url: string,
  module: string
}
