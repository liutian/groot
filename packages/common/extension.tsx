import { ReactElement } from "react";
import React from "react";
import { APIStore } from "./api/API.store";
import { Application, Component, ComponentInstance, Release, Solution } from "./entities";
import { GridLayout } from "./GridLayout";
import { ApplicationData, IframeDebuggerConfig, Metadata, RequestFnType } from "./internal";
import { StudioMode } from "./enum";

// 公开WorkbenchModel类型必须单独定义，不能直接通过ts import(...) ，该语法会导致ts深入解析 workbench项目中 WorkbenchModel 其他依赖项导致重复甚至循环解析


export type MainFunction = (context: ExtensionContext) => ExtensionConfigSchema;

export type ExtensionConfigSchema = {
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

export type RemoteExtension = {
  key?: string,
  package: string,
  title: string,
  url: string,
  module: string
}



// 插件机制

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

export type GrootCommandDict = {
  'gc.workbench.banner.render': [[], ReactElement | null],
  'gc.workbench.activityBar.render': [[], ReactElement | null],
  'gc.workbench.primarySidebar.render': [[], ReactElement | null],
  'gc.workbench.secondarySidebar.render': [[], ReactElement | null],
  'gc.workbench.stage.render': [[], ReactElement | null],
  'gc.workbench.panel.render': [[], ReactElement | null],
  'gc.workbench.statusBar.render': [[], ReactElement | null],

  'gc.fetch.instance': [[number], void],
  'gc.fetch.prototype': [[number, number | null], void],
  'gc.studio.switchIstance': [[number], void],
  'gc.workbench.makeDataToStage': [[number | 'all' | 'current' | 'first'], void],
  'gc.stage.refresh': [[Function] | [], void],
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
  'gs.workbench.stage.viewport': ['desktop' | 'mobile', false],
  'gs.workbench.panel.viewsContainers': [string, true],

  'gs.studio.componentInstance': [ComponentInstance, false],
  'gs.studio.allComponentInstance': [ComponentInstance, true],
  'gs.studio.component': [Component, false],
  'gs.studio.release': [Release, false],
  // 'gs.studio.componentVersion': [ComponentVersion, false],

  'gs.studio.propSettingViews': [{ name: string, remotePackage: string, remoteUrl: string, remoteModule: string }, true],

  'gs.studio.breadcrumbList': [{ id: number, name: string }, true],

  'gs.workbench.banner.views': [{ id: string, placement: 'left' | 'center' | 'right' }, true],

  'gs.workbench.stage.playgroundPath': [string, false],
  'gs.workbench.stage.debugBaseUrl': [string, false],
}

export type GrootHookDict = {
  'gh.studio.prop.change': [[Metadata | Metadata[], boolean] | [Metadata | Metadata[]], void],
  'gh.sidebar.drag.start': [[], void],
  'gh.sidebar.drag.end': [[], void],
  'gh.component.drag.start': [[], void],
  'gh.component.drag.end': [[], void],
  'gh.studio.removeChildComponent': [[number, number, string | null], void],

  [PostMessageType.InnerReady]: [[], void],
  [PostMessageType.OuterSetConfig]: [[IframeDebuggerConfig] | [], void],
  [PostMessageType.InnerFetchApplication]: [[], void],
  [PostMessageType.OuterSetApplication]: [[ApplicationData] | [], void],
  [PostMessageType.InnerApplicationnReady]: [[], void],
  [PostMessageType.InnerFetchView]: [[], void],
  [PostMessageType.OuterUpdateComponent]: [[Metadata | Metadata[]], void],

  [PostMessageType.OuterDragComponentEnter]: [[], void],
  [PostMessageType.OuterDragComponentOver]: [[{ positionX: number, positionY: number }], void],
  [PostMessageType.InnerDragHitSlot]: [[DragAddComponentEventDataType], void],
  [PostMessageType.OuterDragComponentLeave]: [[], void],
  [PostMessageType.OuterDragComponentDrop]: [[{ positionX: number, positionY: number, componentId: number }], void],
  [PostMessageType.InnerOutlineHover]: [[MarkerInfo], void],
  [PostMessageType.InnerUpdateDragAnchor]: [[DragAnchorInfo], void],
  [PostMessageType.InnerOutlineSelect]: [[MarkerInfo], void],
  [PostMessageType.OuterComponentSelect]: [[number], void],
  [PostMessageType.OuterOutlineReset]: [['hover' | 'selected'] | [], void],
  [PostMessageType.InnerOutlineUpdate]: [[{ selected: MarkerInfo, hover: MarkerInfo }], void],

  [PostMessageType.OuterRefreshView]: [[string], void]
}

export type CommandObject = { callback: Function, provider: string, origin?: CommandObject }
export type StateObject = { value: any, provider: string, eventTarget: EventTarget, multi: boolean }
export type HookObject = { callback: Function, provider: string }





export enum PostMessageType {

  InnerReady = 'inner_ready',
  OuterSetConfig = 'outer_set_config',
  InnerFetchApplication = 'inner_fetch_application',
  OuterSetApplication = 'outer_set_application',
  InnerApplicationnReady = 'inner_applicationn_ready',
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








type ViewRender = string | ReactElement | React.FC;

export type ViewsContainer = {
  id: string,
  name: ViewRender,
  icon?: ViewRender,
  view?: ViewRender,
  toolbar?: ViewRender
};

export type ViewChildItem = {
  parent?: string
} & ViewsContainer;

export const viewRender = (view: ViewRender, id?: any) => {
  if (typeof view !== 'function') {
    return <React.Fragment key={id || undefined}>{view}</React.Fragment>;
  }
  const View = view as React.FC;
  return <View key={id || undefined} />
}









export type DragAddComponentEventDataType = {
  propItemId: number,
  abstractValueIdChain?: string,
  parentInstanceId: number
  componentId: number,
  currentInstanceId?: number,
  direction?: 'next' | 'pre'
}

export type MarkerInfo = {
  clientRect: DOMRect,
  tagName: string,
  instanceId: number,
  parentInstanceId?: number,
  rootInstanceId: number,
  propItemId?: number,
  abstractValueIdChain?: string
}

export type DragAnchorInfo = {
  direction: 'bottom' | 'top',
  left: number,
  width: number,
  top: number,
  hitEle?: HTMLElement,
  slotRect: DOMRect
}