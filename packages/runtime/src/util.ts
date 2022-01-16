import { options } from './config';

export function errorInfo(message: string, type?: string): void {
  console.error(`[groot]${type && '(' + type + ')'}: ${message}`);
}

export function debugInfo(message: string, type?: string): void {
  if (options.debug === true) {
    console.log(`[groot]${type && '(' + type + ')'}: ${message}`);
  }
}
