const commonModuleMap = new Map<string, any>();
const mainModuleMap = new Map<string, any>();
let internalOptions: AMDOptions;

initDefaultModule();

if ('define' in window) {
  throw new Error('window.define is exists');
}

window.define = function (moduleName, depModules, wrapper) {
  const moduleCallback = window._moduleCallback;

  const depsPromise = Promise.all(
    depModules.map((depName) => {
      if (depName === 'exports') {
        return Promise.resolve(depName);
      }

      if (internalOptions.injectModule) {
        const mod = internalOptions.injectModule(depName);
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

  depsPromise.then((depModule) => {
    const moduleObj = { __moduleName: moduleName };
    mainModuleMap.set(moduleName, moduleObj);

    const depsModules = depModule.map((keyOrModule) => {
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

export function AMDConfig(options: AMDOptions): void {
  internalOptions = Object.assign({}, options);

  if (options.modules) {
    Object.keys(options.modules).forEach((key) => {
      commonModuleMap.set(key, options.modules[key]);
    });
  }
}

export type AMDOptions = {
  modules: { [key: string]: any };
  injectModule?: (key: string) => any;
};
