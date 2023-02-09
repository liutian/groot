import { ExtensionContext, GrootCommandDict, GrootStateDict } from "@grootio/common"

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