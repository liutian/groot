import { bootstrapOptions } from './config';

export function errorInfo(message: string, type?: string): void {
  console.error(`[groot]-${type && '(' + type + ')'}: ${message}`);
}

export function debugInfo(message: string, type?: string): void {
  if (bootstrapOptions.debug === true) {
    console.log(`[groot]-${type && '(' + type + ')'}: ${message}`);
  }
}

export const iframeNamePrefix = 'groot::';

export const studioMode = window.self !== window.top && window.self.name.startsWith(iframeNamePrefix);
