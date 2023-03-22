import { ReactElement } from "react";
import React from "react";
import { APIStore } from "./api/API.store";
import { Application, Component, ComponentInstance, Release, Solution, State } from "./entities";
import { GridLayout } from "./GridLayout";
import { ApplicationData, Metadata } from "./internal";
import { StudioMode } from "./enum";
import { RequestFnType } from "./request-factory";
import { UIManagerConfig } from "./runtime";



export type GrootContext = {
  params: GrootContextParams,
  commandManager: CommandManager,
  stateManager: StateManager,
  hookManager: HookManager,
  layout: GridLayout,
  onReady: (listener: EventListener) => void;
}

export type GrootContextParams = {
  mode: StudioMode,
  account: any,
  application: Application,
  solution: Solution,
  instanceId?: number,
  componentId?: number,
  versionId?: number
}

export type MainFunction<C> = (context: ExtensionContext, config?: C) => ExtensionConfigSchema;

export type ExtensionConfigSchema = {
  // todo 待开发，参照vscode设计https://code.visualstudio.com/api/references/contribution-points#contributes.configuration
}

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
  main: MainFunction<any>,
  config: any
}


export type CommandManager = <CT extends Record<string, [any[], any]> = GrootCommandDict>() => {
  registerCommand: GrootContextRegisterCommand<CT>,
  executeCommand: GrootContextExecuteCommand<CT>,
}

export type StateManager = <ST extends Record<string, [any, boolean]> = GrootStateDict>() => {
  registerState: GrootContextRegisterState<ST>,
  getState: GrootContextGetState<ST>,
  setState: GrootContextSetState<ST>,
  useStateByName: GrootContextUseStateByName<ST>,
  watchState: GrootContextWatchState<ST>
}

export type HookManager = <HT extends Record<string, [any[], any]> = GrootHookDict>() => {
  registerHook: GrootContextRegisterHook<HT>,
  callHook: GrootContextCallHook<HT>
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
>(hookName: K, hook: (...args: AR) => R, emitPrevArgs?: boolean) => Function

export type GrootContextCallHook<HT extends Record<string, [any[], any]>> = <
  K extends keyof HT & string,
  AR extends HT[K][0],
  R extends HT[K][1]
>(commandName: K, ...args: AR) => R[];

export type GrootCommandDict = {
  'gc.ui.render.banner': [[], ReactElement | null],
  'gc.ui.render.activityBar': [[], ReactElement | null],
  'gc.ui.render.primarySidebar': [[], ReactElement | null],
  'gc.ui.render.secondarySidebar': [[], ReactElement | null],
  'gc.ui.render.stage': [[], ReactElement | null],
  'gc.ui.render.panel': [[], ReactElement | null],
  'gc.ui.render.statusBar': [[], ReactElement | null],

  'gc.fetch.instance': [[number], void],
  'gc.fetch.prototype': [[number, number | null], void],
  'gc.switchIstance': [[number], void],
  'gc.makeDataToStage': [[number | 'all' | 'current' | 'first'], void],
  'gc.stageRefresh': [[Function] | [], void],
}

export type GrootStateDict = {
  'gs.extension.configSchemaList': [ExtensionConfigSchema, true],
  'gs.extension.dataList': [any, true],
  'gs.ui.views': [ViewItem, true],
  'gs.ui.viewsContainers': [ViewContainerItem, true],

  'gs.ui.style.container': [React.CSSProperties, false],
  'gs.ui.style.banner': [React.CSSProperties, false],
  'gs.ui.style.activityBar': [React.CSSProperties, false],
  'gs.ui.style.primarySidebar': [React.CSSProperties, false],
  'gs.ui.style.secondarySidebar': [React.CSSProperties, false],
  'gs.ui.style.stage': [React.CSSProperties, false],
  'gs.ui.style.panel': [React.CSSProperties, false],
  'gs.ui.style.statusBar': [React.CSSProperties, false],

  'gs.ui.activityBar.viewsContainers': [string, true],
  'gs.ui.activityBar.active': [string, false],
  'gs.ui.primarySidebar.active': [string, false],
  'gs.ui.secondarySidebar.active': [string, false],
  'gs.ui.stage.active': [string, false],
  'gs.ui.panel.viewsContainers': [string, true],
  'gs.ui.stageViewport': ['desktop' | 'mobile', false],
  'gs.ui.banner.views': [{ id: string, placement: 'left' | 'center' | 'right' }, true],
  'gs.ui.propSettingViews': [{ name: string, remotePackage: string, remoteUrl: string, remoteModule: string }, true],

  'gs.componentInstance': [ComponentInstance, false],
  'gs.allComponentInstance': [ComponentInstance, true],
  'gs.component': [Component, false],
  'gs.release': [Release, false],

  'gs.propSetting.breadcrumbList': [{ id: number, name: string }, true],
  'gs.stage.playgroundPath': [string, false],
  'gs.stage.debugBaseUrl': [string, false],
  'gs.globalStateList': [State, true],
  'gs.localStateList': [State, true],
}

export type GrootHookDict = {
  'gh.sidebar.dragStart': [[], void],
  'gh.sidebar.dragEnd': [[], void],
  'gh.component.propChange': [[Metadata | Metadata[], boolean] | [Metadata | Metadata[]], void],
  'gh.component.dragStart': [[], void],
  'gh.component.dragEnd': [[], void],
  'gh.component.removeChild': [[number, number, string | null], void],

  [PostMessageType.InnerReady]: [[], void],
  [PostMessageType.OuterSetConfig]: [[IframeDebuggerConfig] | [], void],
  [PostMessageType.InnerFetchApplication]: [[], void],
  [PostMessageType.OuterSetApplication]: [[ApplicationData] | [], void],
  [PostMessageType.InnerApplicationReady]: [[], void],
  [PostMessageType.InnerFetchView]: [[], void],
  [PostMessageType.OuterUpdateComponent]: [[Metadata | Metadata[]], void],

  [PostMessageType.OuterDragComponentEnter]: [[], void],
  [PostMessageType.OuterDragComponentOver]: [[{ positionX: number, positionY: number }], void],
  [PostMessageType.InnerDragHitSlot]: [[DragAddComponentEventData], void],
  [PostMessageType.OuterDragComponentLeave]: [[], void],
  [PostMessageType.OuterDragComponentDrop]: [[{ positionX: number, positionY: number, componentId: number }], void],
  [PostMessageType.InnerOutlineHover]: [[ComponentAnchor], void],
  [PostMessageType.InnerUpdateDragAnchor]: [[ComponentDragAnchor], void],
  [PostMessageType.InnerOutlineSelect]: [[ComponentAnchor], void],
  [PostMessageType.OuterComponentSelect]: [[number], void],
  [PostMessageType.OuterOutlineReset]: [['hover' | 'selected'] | [], void],
  [PostMessageType.InnerOutlineUpdate]: [[{ selected: ComponentAnchor, hover: ComponentAnchor }], void],

  [PostMessageType.OuterRefreshView]: [[string], void]
}

export type ViewContainerItem = {
  id: string,
  name: ViewElement,
  icon?: ViewElement,
  view?: ViewElement,
  toolbar?: ViewElement
};

export type ViewItem = {
  parent?: string
} & ViewContainerItem;



export type ViewElement = string | ReactElement | React.FC;














export const iframeNamePrefix = 'groot_';

/**
 * 设计模式下宿主传递给iframe的配置信息
 */
export type IframeDebuggerConfig = {
  runtimeConfig?: Partial<UIManagerConfig>,
  controlView?: string,
}

export enum PostMessageType {

  InnerReady = 'inner_ready',
  OuterSetConfig = 'outer_set_config',
  InnerFetchApplication = 'inner_fetch_application',
  OuterSetApplication = 'outer_set_application',
  InnerApplicationReady = 'inner_application_ready',
  InnerFetchView = 'inner_fetch_view',
  OuterUpdateState = 'outer_update_state',
  OuterUpdateComponent = 'outer_update_component',
  OuterRefreshView = 'outer_refresh_view',

  OuterDragComponentOver = 'outer_drag_component_over',
  OuterDragComponentEnter = 'outer_drag_component_enter',
  OuterDragComponentLeave = 'outer_drag_component_leave',
  OuterDragComponentDrop = 'outer_drag_component_drop',
  InnerDragHitSlot = 'inner_drag_hit_slot',
  InnerUpdateDragAnchor = 'inner_update_drag_anchor',

  InnerOutlineHover = 'inner_outline_hover',
  InnerOutlineSelect = 'inner_outline_Select',
  InnerOutlineUpdate = 'inner_outline_update',
  OuterOutlineReset = 'outer_outline_reset',
  OuterComponentSelect = 'outer_component_select',
}















export type DragAddComponentEventData = {
  propItemId: number,
  abstractValueIdChain?: string,
  parentInstanceId: number
  componentId: number,
  currentInstanceId?: number,
  direction?: 'next' | 'pre'
}

export type ComponentAnchor = {
  clientRect: DOMRect,
  tagName: string,
  instanceId: number,
  parentInstanceId?: number,
  rootInstanceId: number,
  propItemId?: number,
  abstractValueIdChain?: string
}

export type ComponentDragAnchor = {
  direction: 'bottom' | 'top',
  left: number,
  width: number,
  top: number,
  hitEle?: HTMLElement,
  slotRect: DOMRect
}






