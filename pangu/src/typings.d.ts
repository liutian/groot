

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production';
    readonly APP_ENV: 'online' | 'pl' | 'qa' | 'dev';
  }
}
