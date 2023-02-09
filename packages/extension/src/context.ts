import { ExtensionContext } from "@grootio/common"

let _context: ExtensionContext;

export const getContext = () => {
  return _context;
}

export const setContext = (context: ExtensionContext) => {
  _context = context;
}

export const getGroot = () => {
  return _context.groot;
}