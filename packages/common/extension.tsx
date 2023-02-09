import React, { ReactElement } from "react";
import { APIStore } from "./api/API.store";
import { Application, Component, ComponentInstance, ComponentVersion } from "./entities";
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

export type MainFunction = (context: ExtensionContext) => ExtensionConfigSchema;

export type GrootContext = {
  params: GrootContextParams,
  commandManager: CommandManager,
  stateManager: StateManager,
  layout: GridLayout,
  onReady: (listener: EventListener) => void;
}

export type CommandManager = <CT extends Record<string, [any[], any]>>() => {
  registerCommand: GrootContextRegisterCommand<CT>,
  executeCommand: GrootContextExecuteCommand<CT>,
}

export type StateManager = <ST extends { [key: string]: [any, boolean] } >() => {
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
  instanceId?: number,
  componentId?: number,
  releaseId?: number
}

export type GrootContextRegisterCommand<CT extends Record<string, [any[], any]>> = <K extends keyof CT & string, AR extends CT[K][0], R extends CT[K][1]>(commandName: K, command: (originCommand: Function, ...args: AR) => R, thisArg?: any) => Function
export type GrootContextExecuteCommand<CT extends Record<string, [any[], any]>> = <K extends keyof CT & string, AR extends CT[K][0], R extends CT[K][1]>(commandName: K, ...args: AR) => R;


type BaseDataType = boolean | number | null | undefined | symbol | bigint | string;
export type GrootContextRegisterState<ST extends Record<string, [any, boolean]>> = <K extends keyof ST & string, T extends ST[K][0], B extends ST[K][1], O extends { id: string | number } & T, D extends (B extends true ? (T extends BaseDataType ? T : O)[] : T) > (name: K, defaultValue: D, onChange?: () => void) => boolean;
export type GrootContextGetState<ST extends Record<string, [any, boolean]>> = <K extends keyof ST & string, T extends ST[K][0], B extends ST[K][1], O extends { id: string | number } & T, R extends (B extends true ? (T extends BaseDataType ? T : O)[] : T) >(name: K) => R;
export type GrootContextSetState<ST extends Record<string, [any, boolean]>> = <K extends keyof ST & string, T extends ST[K][0], B extends ST[K][1], O extends { id: string | number } & T, V extends (B extends true ? (T extends BaseDataType ? { index: number, value: T } : O) : T) >(name: K, value?: V, dispatch?: boolean) => boolean;

export type GrootContextUseStateByName<ST extends Record<string, [any, boolean]>> = <
  K extends keyof ST & string,
  T extends ST[K][0],
  B extends ST[K][1],
  O extends { id: string | number } & T,
  N extends (B extends true ? (T extends BaseDataType ? { index: number, value: T } : O) : T),
  R extends (B extends true ? (T extends BaseDataType ? T : O)[] : T),
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
  main: MainFunction,
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


export type GrootCommandDict = {
  'gc.workbench.render.banner': [[], ReactElement | null],
  'gc.workbench.render.activityBar': [[], ReactElement | null],
  'gc.workbench.render.primarySidebar': [[], ReactElement | null],
  'gc.workbench.render.secondarySidebar': [[], ReactElement | null],
  'gc.workbench.render.stage': [[], ReactElement | null],
  'gc.workbench.render.panel': [[], ReactElement | null],
  'gc.workbench.render.statusBar': [[], ReactElement | null],

  'gc.fetch.instance': [[number], void],
  'gc.fetch.prototype': [[number], void]
}

export type GrootStateDict = {
  'gs.extension.configSchema': [ExtensionConfigSchema, true],
  'gs.extension.data': [any, true],
  'gs.ui.views': [ViewChildItem, true],
  'gs.ui.viewsContainers': [ViewsContainer, true],

  'gs.workbench.style.container': [React.CSSProperties, false],
  'gs.workbench.style.banner': [React.CSSProperties, false],
  'gs.workbench.style.activityBar': [React.CSSProperties, false],
  'gs.workbench.style.primarySidebar': [React.CSSProperties, false],
  'gs.workbench.style.secondarySidebar': [React.CSSProperties, false],
  'gs.workbench.style.stage': [React.CSSProperties, false],
  'gs.workbench.style.panel': [React.CSSProperties, false],
  'gs.workbench.style.statusBar': [React.CSSProperties, false],

  'gs.workbench.activityBar.view': [string, true],
  'gs.workbench.activityBar.active': [string, false],
  'gs.workbench.primarySidebar.view': [string, false],
  'gs.workbench.secondarySidebar.view': [string, false],
  'gs.workbench.stage.view': [string, false],
  'gs.workbench.panel.view': [string, true],

  'gs.studio.rootComponentInstance': [ComponentInstance, false],
  'gs.studio.component': [Component, false],
  'gs.studio.componentVersion': [ComponentVersion, false],
  'gs.studio.allComponentInstance': [ComponentInstance[], false],
}



type ViewRender = string | ReactElement | React.FC;

export type CommandObject = { thisArg?: any, callback: Function, provider: string, origin?: CommandObject }
export type StateObject = { value: any, provider: string, eventTarget: EventTarget }

export type ViewsContainer = {
  id: string,
  name: ViewRender,
  icon?: ViewRender,
  view?: ViewRender,
  toolbar?: ViewRender
};

export type ViewChildItem = {
  parent: string
} & ViewsContainer;

export const viewRender = (view: ViewRender, id?: any) => {
  if (typeof view !== 'function') {
    return <React.Fragment key={id || undefined}>{view}</React.Fragment>;
  }
  const View = view as React.FC;
  return <View key={id || undefined} />
}


