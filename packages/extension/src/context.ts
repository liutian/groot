import { ExtensionContext, GrootCommandDict, GrootHookDict, GrootStateDict, StudioMode } from "@grootio/common"

let _context: ExtensionContext;

export const getContext = () => {
  return _context;
}

export const setContext = (context: ExtensionContext) => {
  _context = context;
}

export const grootStateManager = () => {
  return _context.groot.stateManager<GrootStateDict>();
}

export const grootCommandManager = () => {
  return _context.groot.commandManager<GrootCommandDict>();
}

export const grootHookManager = () => {
  return _context.groot.hookManager<GrootHookDict>();
}


export const isPrototypeMode = () => {
  return _context.groot.params.mode === StudioMode.Prototype;
}

export const commandBridge = {
  stageRefresh: (callback: Function): void => {
    throw new Error('方法为实现')
  }
}