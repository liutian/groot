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
  command: {
    registerCommand: GrootContextRegisterCommand,
    executeCommand: GrootContextExecuteCommand,
  },
  state: {
    registerState: GrootContextRegisterState,
    registerStateMulti: GrootContextRegisterStateMulti,
    getState: GrootContextGetState,
    setState: GrootContextSetState,
    removeState: GrootContextRemoveState
  },
  layout: GridLayout,
  onReady: (listener: EventListener) => void;
  useStateByName: GrootContextUseStateByName
}

export type GrootContextParams = {
  mode: StudioMode,
  account: any,
  application: Application,
  solution: any,
}

export type GrootContextRegisterCommand = <CT extends Record<string, [any[], any]>>(command: keyof CT & string, callback: (originCallback: any, ...args: CT[keyof CT & string][0]) => CT[keyof CT & string][1], thisArg?: any) => Function
export type GrootContextExecuteCommand = <CT extends Record<string, [any[], any]>>(command: keyof CT & string, ...args: CT[keyof CT & string][0]) => CT[keyof CT & string][1];



export type GrootContextRegisterState = <ST extends Record<string, [any, false]>> (name: keyof ST & string, defaultValue?: ST[keyof ST & string][0], eventTarget?: EventTarget) => void;
export type GrootContextRegisterStateMulti = <ST extends Record<string, [{ id: string }, true]>> (name: keyof ST & string, defaultValue?: ST[keyof ST & string][0][], eventTarget?: EventTarget) => void;
export type GrootContextGetState = <ST extends Record<string, [any, boolean]>>(name: keyof ST & string) => ST[keyof ST & string][1] extends true ? ST[keyof ST & string][0][] : ST[keyof ST & string][0];
export type GrootContextSetState = <ST extends Record<string, [{ id: string }, true] | [{ id: string }, false]>>(name: keyof ST & string, value: ST[keyof ST & string][0], dispatch?: boolean) => boolean;
export type GrootContextRemoveState = <ST extends Record<string, [{ id: string }, true]>>(name: keyof ST & string, id: string, dispatch?: boolean) => boolean;



export type GrootContextUseStateByName = <ST extends Record<string, [any, boolean]>>(name: keyof ST & string, defaultValue?: any) => ST[keyof ST & string][1] extends true ? ST[keyof ST & string][0][] : ST[keyof ST & string][0];

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
  view?: React.FC,
  toolbar?: React.FC
}
