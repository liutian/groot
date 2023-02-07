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

export type MainType = (context: ExtensionContext) => ExtensionConfig;

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



export type GrootContextRegisterState<ST extends Record<string, [any, boolean]>> = <K extends keyof ST & string, T extends ST[K][0], B extends ST[K][1], D extends (B extends true ? { id: string, value: T }[] : T) > (name: K, defaultValue: D, eventTarget?: EventTarget) => boolean;
export type GrootContextGetState<ST extends Record<string, [any, boolean]>> = <K extends keyof ST & string, T extends ST[K][0], B extends ST[K][1], R extends (B extends true ? { id: string, value: T }[] : T) >(name: K) => R;
export type GrootContextSetState<ST extends Record<string, [any, boolean]>> = <K extends keyof ST & string, T extends ST[K][0], B extends ST[K][1], V extends (B extends true ? { id: string, value?: T } : T) >(name: K, value?: V, dispatch?: boolean) => boolean;

export type GrootContextUseStateByName<ST extends Record<string, [any, boolean]>> = <K extends keyof ST & string, T extends ST[K][0], B extends ST[K][1], R extends (B extends true ? { id: string, value: T }[] : T), D extends R>(name: K, defaultValue?: D) => R;

export type ExtensionContext = {
  extName: string,
  extPackageName: string,
  extPackageUrl: string,
  request: RequestFnType<APIStore>,
  groot: GrootContext
}

export type ExtensionRuntime = {
  name: string,
  packageName: string,
  packageUrl: string,
  main: MainType,
  config: ExtensionConfig
}


export type HostConfig = {
}

export type ExtensionConfig = {
}

export type RemoteExtension = {
  key?: string,
  package: string,
  title: string,
  url: string,
  module: string
}


export type GrootCommandType = {
  'groot.command.workbench.render.activityBar': [[], ReactElement | null],
}

export type GrootStateType = {
  'groot.state.workbench.style.container': [React.CSSProperties, false],
  'groot.state.workbench.style.toolBar': [React.CSSProperties, false],
  'groot.state.workbench.style.activityBar': [React.CSSProperties, false],
  'groot.state.workbench.style.primarySidebar': [React.CSSProperties, false],
  'groot.state.workbench.style.secondarySidebar': [React.CSSProperties, false],
  'groot.state.workbench.style.editor': [React.CSSProperties, false],
  'groot.state.workbench.style.panel': [React.CSSProperties, false],
  'groot.state.workbench.style.statusBar': [React.CSSProperties, false],

  'groot.state.ui.views': [ViewType, true],
  'groot.state.ui.viewsContainers': [ViewType, true],
  'groot.state.workbench.view.toolBar': [string, true]
}

export type ViewType = {
  id: string,
  icon: string | ReactElement,
  name: React.FC | string,
  view: React.FC,
  toolbar: React.FC
}
