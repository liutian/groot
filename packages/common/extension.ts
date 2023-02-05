import React, { ReactElement } from "react";
import { APIStore } from "./api/API.store";
import { Application, ComponentInstance, State } from "./entities";
import { GridLayout } from "./GridLayout";
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
  params: GrootContextParams,
  commands: {
    registerCommand: GrootContextRegisterCommand,
    executeCommand: GrootContextExecuteCommand,
  },
  states: {
    registerState: GrootContextRegisterState,
    getState: GrootContextGetState,
    setState: GrootContextSetState
  },
  layout: GridLayout,
  onReady: (listener: EventListener) => void;
}

export type GrootContextParams = {
  mode: StudioMode,
  account: any,
  application: Application,
  solution: any,
}

export type GrootContextRegisterCommand = <CT extends Record<string, [any[], any]>>(command: keyof CT & string, callback: (originCallback: any, ...args: CT[keyof CT & string][0]) => CT[keyof CT & string][1], thisArg?: any) => Function
export type GrootContextExecuteCommand = <CT extends Record<string, [any[], any]>>(command: keyof CT & string, ...args: CT[keyof CT & string][0]) => CT[keyof CT & string][1];



export type GrootContextRegisterState = <ST extends Record<string, any>> (name: keyof ST & string, eventTarget?: EventTarget, defaultValue?: ST[keyof ST & string]) => void;
export type GrootContextGetState = <ST extends Record<string, any>>(name: keyof ST & string) => ST[keyof ST & string];
export type GrootContextSetState = <ST extends Record<string, any>>(name: keyof ST & string, value: ST[keyof ST & string], dispatch?: boolean) => void;



export type GrootContextUseStateByName = <ST extends Record<string, any>>(name: keyof ST & string) => ST[keyof ST & string];

export type ExtensionContext = {
  extName: string,
  extUrl: string,
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


export type GrootCommandType = {
  'groot.workbench.render.activityBar': [[], ReactElement<any, any> | null]
}

export type GrootStateType = {

}