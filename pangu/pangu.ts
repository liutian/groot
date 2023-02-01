
const config = (): PanguConfig => {
  return {
    rootId: 'pangu',
    shared: {
      react: {
        eager: true,
        singleton: true,
        requiredVersion: '^18.2.0'
      },
      'react-dom': {
        eager: true,
        singleton: true,
        requiredVersion: '^18.2.0'
      },
      'react/jsx-runtime': {
        eager: true,
        singleton: true,
        requiredVersion: '^18.2.0'
      },
      antd: {
        eager: true,
        singleton: true,
        requiredVersion: '^5.1.7'
      },
      '@ant-design/icons': {
        singleton: true,
        eager: true,
        requiredVersion: '^5.0.1'
      },
      axios: {
        singleton: true,
        eager: true,
        requiredVersion: '^1.3.0'
      },
      dayjs: {
        singleton: true,
        eager: true,
        requiredVersion: '^1.11.7'
      },
      'react-router-dom': {
        singleton: true,
        eager: true,
        requiredVersion: '^6.8.0'
      },
      '@grootio/common': {
        singleton: true,
        eager: true,
        requiredVersion: '^0.0.1'
      }
    },
    appConfig: {
      studio: {
        bootstrap: true,
        packageName: 'grootStudio',
        packageUrl: 'http://groot-local.com:13000/studio/index.js'
      }
    }
  }
}

export type PanguConfig = {
  rootId: string
  appConfig: Record<string, PanguAppConfig>,
  shared: Record<string, {
    /**
    * Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
    */
    eager?: boolean;
    /**
     * Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.
     */
    import?: string | false;
    /**
     * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
     */
    packageName?: string;
    /**
     * Version requirement from module in share scope.
     */
    requiredVersion?: string | false;
    /**
     * Module is looked up under this key from the share scope.
     */
    shareKey?: string;
    /**
     * Share scope name.
     */
    shareScope?: string;
    /**
     * Allow only a single version of the shared module in share scope (disabled by default).
     */
    singleton?: boolean;
    /**
     * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
     */
    strictVersion?: boolean;
    /**
     * Version of the provided module. Will replace lower matching versions, but not higher.
     */
    version?: string | false;
  }>
}

export type PanguAppConfig = {
  bootstrap?: boolean,
  packageName?: string,
  packageUrl: string
}

export default config;