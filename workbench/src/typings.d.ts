
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


type CodeMetaStudioType = {
  name: string;
  propGroups: CodeMetaPropGroup[]
}

type CodeMetaPropGroup = {
  title: string,
  key: string,
  propBlocks: CodeMetaPropBlock[]
}

type CodeMetaPropBlock = {
  title: string,
  key: string,
  propItems: CodeMetaPropItem[],
  formInstanceRef: { current: any }
}

type CodeMetaPropItem = {
  key: string,
  label: string,
  value?: any,
  type: 'input' | 'date-picker'
}