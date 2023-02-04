import { ReactElement } from "react";
import { APIStore } from "./api/API.store";
import { Application, ComponentInstance, State } from "./entities";
import { RequestFnType } from "./internal";

export enum StudioMode {
  Prototype = 'prototype',
  Instance = 'instance'
}

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


export type ExtensionViewComponent = React.FC<{
}>;

export enum ModalStatus {
  None = 'none',
  Init = 'init',
  Submit = 'submit'
}

export type MainType = (context: ExtensionContext) => ExtensionConfig;

export type GrootContext = {
  commands: {
    registerCommand: GrootContextRegisterCommand;
    executeCommand: GrootContextExecuteCommand
  }
}

export type GrootContextRegisterCommand = <CT extends Record<string, [any[], any]>>(command: keyof CT & string, callback: (...args: CT[keyof CT & string][0]) => CT[keyof CT & string][1], thisArg?: any) => Function
export type GrootContextExecuteCommand = <CT extends Record<string, [any[], any]>>(command: keyof CT & string, ...args: CT[keyof CT & string][0]) => CT[keyof CT & string][1];

export type ExtensionContext = {
  request: RequestFnType<APIStore>,
  workbenchModel?: WorkbenchModelType,
  groot: GrootContext
}

export type ExtensionRuntime = {
  key: string,
  url: string,
  main: MainType,
  config: ExtensionConfig
}

export enum WorkbenchEvent {
  LaunchFinish = 'launch_finish',

  DragComponentStart = 'drag_component_start',
  DragComponentEnd = 'drag_component_end',
}

export enum StudioEvent {
  LaunchFinish = 'launch_finish',
}

export type HostConfig = {
}

export type ExtensionConfig = {
  contributes?: {
    // sidebarView?: SidebarViewType[],
    // propSettingView?: RemoteExtension[]
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
  view: RemoteExtension
})

export type RemoteExtension = {
  key?: string,
  package: string,
  title: string,
  url: string,
  module: string
}
