import React, { ReactElement } from "react";
import { APIStore } from "./api/API.store";
import { Application } from "./entities";
import { GridLayout } from "./GridLayout";
import { RequestFnType } from "./internal";

export enum StudioMode {
  Prototype = 'prototype',
  Instance = 'instance'
}

export type ModelClass<T> = (new () => T) & { modelName: string };

export type UseModelFnType = <T>(model: ModelClass<T>, isRoot?: boolean) => T;

// 公开WorkbenchModel类型必须单独定义，不能直接通过ts import(...) ，该语法会导致ts深入解析 workbench项目中 WorkbenchModel 其他依赖项导致重复甚至循环解析

export enum ModalStatus {
  None = 'none',
  Init = 'init',
  Submit = 'submit'
}

export type MainType = (context: ExtensionContext) => ExtensionConfigSchema;

export type GrootContext = {
  params: GrootContextParams,
  commandManager: CommandManagerType,
  stateManager: StateManagerType,
  layout: GridLayout,
  onReady: (listener: EventListener) => void;
}

export type CommandManagerType = <CT extends Record<string, [any[], any]>>() => {
  registerCommand: GrootContextRegisterCommand<CT>,
  executeCommand: GrootContextExecuteCommand<CT>,
}

export type StateManagerType = <ST extends { [key: string]: [any, boolean] } >() => {
  registerState: GrootContextRegisterState<ST>,
  getState: GrootContextGetState<ST>,
  setState: GrootContextSetState<ST>,
  useStateByName: GrootContextUseStateByName<ST>
}

export type GrootContextParams = {
  mode: StudioMode,
  account: any,
  application: Application,
  solution: any,
}

export type GrootContextRegisterCommand<CT extends Record<string, [any[], any]>> = <K extends keyof CT & string, AR extends CT[K][0], R extends CT[K][1]>(commandName: K, command: (originCommand: Function, ...args: AR) => R, thisArg?: any) => Function
export type GrootContextExecuteCommand<CT extends Record<string, [any[], any]>> = <K extends keyof CT & string, AR extends CT[K][0], R extends CT[K][1]>(commandName: K, ...args: AR) => R;


type BaseType = boolean | number | null | undefined | symbol | bigint | string;
export type GrootContextRegisterState<ST extends Record<string, [any, boolean]>> = <K extends keyof ST & string, T extends ST[K][0], B extends ST[K][1], O extends { id: string | number } & T, D extends (B extends true ? (T extends BaseType ? T : O)[] : T) > (name: K, defaultValue: D, onChange?: () => void) => boolean;
export type GrootContextGetState<ST extends Record<string, [any, boolean]>> = <K extends keyof ST & string, T extends ST[K][0], B extends ST[K][1], O extends { id: string | number } & T, R extends (B extends true ? (T extends BaseType ? T : O)[] : T) >(name: K) => R;
export type GrootContextSetState<ST extends Record<string, [any, boolean]>> = <K extends keyof ST & string, T extends ST[K][0], B extends ST[K][1], O extends { id: string | number } & T, V extends (B extends true ? (T extends BaseType ? { index: number, value: T } : O) : T) >(name: K, value?: V, dispatch?: boolean) => boolean;

export type GrootContextUseStateByName<ST extends Record<string, [any, boolean]>> = <
  K extends keyof ST & string,
  T extends ST[K][0],
  B extends ST[K][1],
  O extends { id: string | number } & T,
  N extends (B extends true ? (T extends BaseType ? { index: number, value: T } : O) : T),
  R extends (B extends true ? (T extends BaseType ? T : O)[] : T),
  D extends R
>(name: K, defaultValue?: D) => [R, (newValue: N) => void];

export type ExtensionContext = {
  extName: string,
  extPackageName: string,
  extPackageUrl: string,
  extConfig: any,
  request: RequestFnType<APIStore>,
  groot: GrootContext,
}

export type ExtensionRuntime = {
  name: string,
  packageName: string,
  packageUrl: string,
  main: MainType,
  config: any
}


export type HostConfig = {
}

export type ExtensionConfigSchema = {
}

export type RemoteExtension = {
  key?: string,
  package: string,
  title: string,
  url: string,
  module: string
}


export type GrootCommandType = {
  'groot.command.workbench.render.banner': [[], ReactElement | null],
  'groot.command.workbench.render.activityBar': [[], ReactElement | null],
  'groot.command.workbench.render.primarySidebar': [[], ReactElement | null],
  'groot.command.workbench.render.secondarySidebar': [[], ReactElement | null],
  'groot.command.workbench.render.stage': [[], ReactElement | null],
  'groot.command.workbench.render.panel': [[], ReactElement | null],
  'groot.command.workbench.render.statusBar': [[], ReactElement | null],
}

export type GrootStateType = {
  'groot.extension.config_schema': [ExtensionConfigSchema, true],
  'groot.extension.data': [any, true],
  'groot.state.workbench.style.container': [React.CSSProperties, false],
  'groot.state.workbench.style.banner': [React.CSSProperties, false],
  'groot.state.workbench.style.activityBar': [React.CSSProperties, false],
  'groot.state.workbench.style.primarySidebar': [React.CSSProperties, false],
  'groot.state.workbench.style.secondarySidebar': [React.CSSProperties, false],
  'groot.state.workbench.style.stage': [React.CSSProperties, false],
  'groot.state.workbench.style.panel': [React.CSSProperties, false],
  'groot.state.workbench.style.statusBar': [React.CSSProperties, false],

  'groot.state.ui.views': [ViewType, true],
  'groot.state.ui.viewsContainers': [ViewsContainerType, true],

  'groot.state.workbench.activityBar.view': [string, true],
  'groot.state.workbench.activityBar.active': [string, false],

  'groot.state.workbench.primarySidebar.view': [string, false],
  'groot.state.workbench.secondarySidebar.view': [string, false],
  'groot.state.workbench.stage.view': [string, false],
  'groot.state.workbench.panel.view': [string, true],
}



type ViewRenderType = string | ReactElement | React.FC;

export type ViewsContainerType = {
  id: string,
  name: ViewRenderType,
  icon?: ViewRenderType,
  view?: ViewRenderType,
  toolbar?: ViewRenderType
};

export type ViewType = {
  parent: string
} & ViewsContainerType;

export const viewRender = (view: ViewRenderType, id?: any) => {
  if (typeof view !== 'function') {
    return <React.Fragment key={id || undefined}>{view}</React.Fragment>;
  }
  const View = view as React.FC;
  return <View key={id || undefined} />
}


