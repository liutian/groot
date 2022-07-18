import { globalConfig } from "./config";

export const iframeNamePrefix = 'groot::';

export const designMode = window.self !== window.top && window.self.name.startsWith(iframeNamePrefix);

export function errorInfo(message: string, type?: string): void {
  console.error(`[groot]-${type && '(' + type + ')'}: ${message}`);
}

export function debugInfo(message: string, type?: string): void {
  if (globalConfig.debug === true) {
    console.log(`[groot]-${type && '(' + type + ')'}: ${message}`);
  }
}

