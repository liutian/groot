
declare module '*.less';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly APP: 'online' | 'pl' | 'qa' | 'dev';
  }
}

interface Window {
  define: (
    moduleName: string,
    depsKey: string[],
    wrapper: (...defaultModule: any) => void
  ) => void;
  _moduleCallback: (module: any) => void;
}

declare const __webpack_share_scopes__: any;
