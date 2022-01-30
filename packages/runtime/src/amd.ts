const commonModuleMap = new Map<string, any>();
const mainModuleMap = new Map<string, any>();
let internalOptions: AMDModuleOption;

initDefaultModule();

if ('define' in window) {
  throw new Error('window.define is exists');
}

window.define = function (moduleName, depModuleNames, wrapper) {
  const moduleCallback = window._moduleCallback;

  const depsPromise = Promise.all(
    depModuleNames.map((depName) => {
      if (depName === 'exports') {
        return Promise.resolve(depName);
      }

      if (internalOptions.moduleFactory) {
        const mod = internalOptions.moduleFactory(depName);
        if (mod) {
          commonModuleMap.set(depName, mod);
        }
      }

      if (commonModuleMap.get(depName)) {
        if (typeof commonModuleMap.get(depName).then === 'function') {
          return commonModuleMap.get(depName).then((mod: any) => {
            commonModuleMap.set(depName, mod);
            return mod;
          });
        }

        return Promise.resolve(commonModuleMap.get(depName));
      } else {
        throw Error('not found depModule :' + depName);
      }
    })
  );

  depsPromise.then((depModules) => {
    const moduleObj = { __moduleName: moduleName };
    mainModuleMap.set(moduleName, moduleObj);

    const depsModules = depModules.map((keyOrModule) => {
      if (keyOrModule === 'exports') {
        return moduleObj;
      }
      return keyOrModule;
    });

    wrapper(...depsModules);
    moduleCallback(moduleObj);
  });
};

function initDefaultModule() {
  commonModuleMap.set('require', requireModule);
}

function requireModule() {
  throw new Error('call require');
}

export function initAMDModules(options: AMDModuleOption): void {
  internalOptions = { ...options };

  if (options.modules) {
    Object.keys(options.modules).forEach((key) => {
      commonModuleMap.set(key, options.modules[key]);
    });
  }
}

/**
 * AMD模块配置项
 */
export type AMDModuleOption = {
  /**
   * 注入的模块实例，通过包名归类，例如：
   * {
   *   antd: {
   *      Button,
   *      Input,
   *      ...
   *   }
   * }
   */
  modules: { [packageName: string]: { [moduleName: string]: any } };
  /**
   * 当modules找不到模块实例时，会调用该方法，该方法需要确保返回模块实例
   */
  moduleFactory?: (key: string) => any;
};
