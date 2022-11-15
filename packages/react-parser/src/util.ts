import { IframeControlType, iframeNamePrefix } from "@grootio/common";
import { globalConfig } from "./config";

export const controlMode = window.self !== window.top && window.self.name.startsWith(iframeNamePrefix);
export const controlType: IframeControlType = (controlMode ? window.self.name.replace(iframeNamePrefix, '') : '') as IframeControlType;

export function errorInfo(message: string, type?: string): void {
  console.error(`[groot]-${type && '(' + type + ')'}: ${message}`);
}

export function debugInfo(message: string, type?: string): void {
  if (globalConfig.debug === true) {
    console.log(`[groot]-${type && '(' + type + ')'}: ${message}`);
  }
}

