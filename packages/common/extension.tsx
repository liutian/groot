import React, { ReactElement } from "react";
import { APIStore } from "./api/API.store";
import { PostMessageType } from "./data";
import { Application, Component, ComponentInstance, ComponentVersion, PropGroup, PropItem } from "./entities";
import { GridLayout } from "./GridLayout";
import { DragAddComponentEventDataType, Metadata, RequestFnType } from "./internal";

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
  hookManager: HookManager,
  layout: GridLayout,
  onReady: (listener: EventListener) => void;
}

export type CommandManager = <CT extends Record<string, [any[], any]>>() => {
  registerCommand: GrootContextRegisterCommand<CT>,
  executeCommand: GrootContextExecuteCommand<CT>,
}

export type StateManager = <ST extends Record<string, [any, boolean]>>() => {
  registerState: GrootContextRegisterState<ST>,
  getState: GrootContextGetState<ST>,
  setState: GrootContextSetState<ST>,
  useStateByName: GrootContextUseStateByName<ST>,
  watchState: GrootContextWatchState<ST>
}

export type HookManager = <HT extends Record<string, [any[], any]>>() => {
  registerHook: GrootContextRegisterHook<HT>,
  callHook: GrootContextCallHook<HT>
}

export type GrootContextParams = {
  mode: StudioMode,
  account: any,
  application: Application,
  solution: any,
  instanceId?: number,
  componentId?: number,
  releaseId?: number,
  versionId?: number
}

export type GrootContextRegisterCommand<CT extends Record<string, [any[], any]>> = <K extends keyof CT & string, AR extends CT[K][0], R extends CT[K][1]>(commandName: K, command: (originCommand: Function, ...args: AR) => R) => Function
export type GrootContextExecuteCommand<CT extends Record<string, [any[], any]>> = <K extends keyof CT & string, AR extends CT[K][0], R extends CT[K][1]>(commandName: K, ...args: AR) => R;


export type GrootContextRegisterState<ST extends Record<string, [any, boolean]>> = <
  K extends keyof ST & string,
  T extends ST[K][0],
  B extends ST[K][1],
  D extends (B extends true ? T[] : T),
  N extends D
> (name: K, defaultValue: D, multi: B, onChange?: (newValue: N) => void) => boolean;

export type GrootContextGetState<ST extends Record<string, [any, boolean]>> = <
  K extends keyof ST & string,
  T extends ST[K][0],
  B extends ST[K][1],
  R extends (B extends true ? T[] : T),
>(name: K) => R;

export type GrootContextWatchState<ST extends Record<string, [any, boolean]>> = <
  K extends keyof ST & string,
  T extends ST[K][0],
  B extends ST[K][1],
  N extends (B extends true ? T[] : T),
>(name: K, onChange: (newValue: N) => void) => Function;

export type GrootContextSetState<ST extends Record<string, [any, boolean]>> = <
  K extends keyof ST & string,
  T extends ST[K][0],
  B extends ST[K][1],
  V extends (B extends true ? T[] : T)
>(name: K, value: V) => V;

export type GrootContextUseStateByName<ST extends Record<string, [any, boolean]>> = <
  K extends keyof ST & string,
  T extends ST[K][0],
  B extends ST[K][1],
  R extends (B extends true ? T[] : T),
  N extends R,
  D extends R
>(name: K, defaultValue?: D) => [R, (newValue: N) => R];

export type GrootContextRegisterHook<HT extends Record<string, [any[], any]>> = <
  K extends keyof HT & string,
  AR extends HT[K][0],
  R extends HT[K][1]
>(hookName: K, hook: (...args: AR) => R, thisArg?: any) => Function

export type GrootContextCallHook<HT extends Record<string, [any[], any]>> = <
  K extends keyof HT & string,
  AR extends HT[K][0],
  R extends HT[K][1]
>(commandName: K, ...args: AR) => R[];


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
  'gc.workbench.banner.render': [[], ReactElement | null],
  'gc.workbench.activityBar.render': [[], ReactElement | null],
  'gc.workbench.primarySidebar.render': [[], ReactElement | null],
  'gc.workbench.secondarySidebar.render': [[], ReactElement | null],
  'gc.workbench.stage.render': [[], ReactElement | null],
  'gc.workbench.panel.render': [[], ReactElement | null],
  'gc.workbench.statusBar.render': [[], ReactElement | null],

  'gc.fetch.instance': [[number], void],
  'gc.fetch.prototype': [[number, number], void],
  'gc.workbench.makeDataToStage': [[number | 'all' | 'current'], void],
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

  'gs.workbench.activityBar.viewsContainers': [string, true],
  'gs.workbench.activityBar.active': [string, false],
  'gs.workbench.primarySidebar.viewsContainer': [string, false],
  'gs.workbench.secondarySidebar.viewsContainer': [string, false],
  'gs.workbench.stage.view': [string, false],
  'gs.workbench.panel.viewsContainers': [string, true],

  'gs.studio.componentInstance': [ComponentInstance, false],
  'gs.studio.allComponentInstance': [ComponentInstance, true],
  'gs.studio.component': [Component, false],
  // 'gs.studio.componentVersion': [ComponentVersion, false],

  'gs.studio.propSettingView': [{ name: string, packageName: string, packageUrl: string, module: string }, true]
}

export type GrootHookDict = {
  'gh.stage.syncData': [[Metadata | Metadata[]], void],
  [PostMessageType.OuterUpdateComponent]: [[any], void],
  [PostMessageType.OuterComponentSelect]: [[number], void]
  [PostMessageType.OuterOutlineReset]: [[], void],
  [PostMessageType.InnerDragHitSlot]: [[DragAddComponentEventDataType], void]
}



type ViewRender = string | ReactElement | React.FC;

export type CommandObject = { callback: Function, provider: string, origin?: CommandObject }
export type StateObject = { value: any, provider: string, eventTarget: EventTarget, multi: boolean }
export type HookObject = { callback: Function, provider: string }

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


