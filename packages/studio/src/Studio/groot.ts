import { CommandManagerType, ExtensionRuntime, GridLayout, GrootContextExecuteCommand, GrootContextGetState, GrootContextParams, GrootContextRegisterCommand, GrootContextRegisterState, GrootContextSetState, GrootContextUseStateByName, isBaseType, loadRemoteModule, MainType, StateManagerType, wrapperState } from "@grootio/common"
import { useEffect, useReducer } from "react";
import request from "util/request";

let registorReady = false;
const commandMap = new Map<string, { thisArg?: any, callback: Function, provider: string }>();
let extensionList: ExtensionRuntime[] = [];
const stateMap = new Map<string, { value: any, provider: string, eventTarget: EventTarget }>();
let tempProvider = ''
const contextEventTarget = new EventTarget();

export const loadExtension = (remoteExtensionList: ExtensionRuntime[]) => {
  return Promise.all(remoteExtensionList.map(item => {
    return loadRemoteModule(item.packageName, 'Main', item.packageUrl);
  }))
    .then(
      moduleList => moduleList.map(m => m.default),
      (error) => {
        console.error('加载插件失败');
        return Promise.reject(error);
      })
    .then((mainList: MainType[]) => {
      return remoteExtensionList.map(({ packageName, packageUrl, name }, index) => {
        return { packageName, packageUrl, main: mainList[index], config: null, name }
      })
    })
}

export const execExtension = (remoteExtensionList: ExtensionRuntime[], params: GrootContextParams, layout: GridLayout) => {
  const configList = remoteExtensionList.map(({ name, main, packageName, packageUrl }, index) => {
    const requestClone = request.clone((type) => {
      if (type === 'request') {
        console.log(`[${extensionList[index].packageName} request]`);
      }
    });

    tempProvider = packageName;
    const extensionConfig = main({
      extName: name,
      extPackageName: packageName,
      extPackageUrl: packageUrl,
      request: requestClone,
      groot: {
        params,
        layout,
        stateManager,
        commandManager,
        onReady: function (listener) {
          contextEventTarget.addEventListener('ready', listener);
        }
      }
    });
    tempProvider = undefined;

    return extensionConfig;
  });

  registorReady = true;
  contextEventTarget.dispatchEvent(new Event('ready'));

  extensionList = remoteExtensionList.map(({ name, packageName, packageUrl }, index) => {
    return {
      name,
      packageName,
      packageUrl,
      main: remoteExtensionList[index].main,
      config: configList[index]
    }
  })
}


const registerCommand: GrootContextRegisterCommand<Record<string, [any[], any]>> = (command, callback, thisArg?) => {
  if (registorReady) {
    throw new Error('命令系统已准备完成，不可再次注册命令');
  }
  if (commandMap.has(command)) {
    console.warn(`命令:${String(command)} 已经存在`);
  }
  commandMap.set(command, {
    callback,
    thisArg,
    provider: tempProvider
  });
  return () => {
    if (commandMap.has(command) && commandMap.get(command).callback !== callback) {
      console.warn(`命令:${String(command)} 已经被覆盖`)
    }
    commandMap.delete(command);
  }
}

export const executeCommand: GrootContextExecuteCommand<Record<string, [any[], any]>> = (command, ...args) => {
  if (!registorReady) {
    throw new Error(`命令系统未准备就绪`)
  }
  if (!commandMap.has(command)) {
    throw new Error(`命令:${String(command)} 未找到`)
  }
  const { callback, thisArg } = commandMap.get(command);
  return callback.apply(thisArg, args);
}


const registerState: GrootContextRegisterState<Record<string, [any, boolean]>> = (name, defaultValue, eventTarget = new EventTarget()) => {
  if (registorReady) {
    throw new Error('状态系统已准备完成，不可再次注册状态');
  }

  if (Array.isArray(defaultValue)) {
    for (const item of defaultValue as { id: string, value: any }[]) {
      if (!item.id || item.value === undefined || item.value === null) {
        throw new Error('列表状态不允许id和value为空')
      }
    }
  }

  let stateValue;
  if (Array.isArray(defaultValue)) {
    stateValue = defaultValue.map(item => {
      return wrapperState(item, () => {
        eventTarget.dispatchEvent(new Event('change'))
      })
    })
  } else {
    stateValue = wrapperState(defaultValue, () => {
      eventTarget.dispatchEvent(new Event('change'))
    })
  }
  stateMap.set(name, {
    value: stateValue,
    provider: tempProvider,
    eventTarget,
  });

  if (stateMap.has(name)) {
    console.warn(`状态:${name} 已被覆盖`);
    return true;
  }

  return false;
}

const getState: GrootContextGetState<Record<string, [any, boolean]>> = (name) => {
  if (!stateMap.get(name)) {
    console.warn(`状态:${name} 未找到`)
  }

  const stateData = stateMap.get(name);
  return stateData.value;
}

const setState: GrootContextSetState<Record<string, [any, boolean]>> = (name, newValue, dispatch = true) => {
  if (!registorReady) {
    throw new Error(`状态系统未准备就绪`)
  }
  if (!stateMap.get(name)) {
    throw new Error(`状态:${name} 未找到`)
  }

  const stateData = stateMap.get(name);
  if (Array.isArray(stateData.value)) {
    if (!newValue) {
      stateData.value = [];
      if (dispatch) {
        stateData.eventTarget.dispatchEvent(new Event('change'));
      }
      return true;
    }

    if (!newValue.id) {
      throw new Error(`状态:${name} 值id缺失`);
    }

    const index = (stateData.value as { id: string }[]).findIndex(item => item.id === newValue.id);
    if (newValue.value !== undefined || newValue.value !== null || !Number.isNaN(newValue.value)) {
      if (index === -1) {
        stateData.value.push(
          wrapperState(newValue, () => {
            stateData.eventTarget.dispatchEvent(new Event('change'))
          })
        )
        if (dispatch) {
          stateData.eventTarget.dispatchEvent(new Event('change'));
        }
        return true;
      } else if (stateData.value[index].value !== newValue.value) {
        stateData.value[index].value = wrapperState(newValue, () => {
          stateData.eventTarget.dispatchEvent(new Event('change'))
        })
        if (dispatch) {
          stateData.eventTarget.dispatchEvent(new Event('change'));
        }
        return true;
      }
    } else if (index !== -1) {
      stateData.value.splice(index, 1);
      if (dispatch) {
        stateData.eventTarget.dispatchEvent(new Event('change'));
      }
      return true;
    }
  } else {
    if (newValue !== stateData.value) {
      if (isBaseType(newValue)) {
        stateData.value = newValue;
      } else {
        stateData.value = wrapperState(newValue, () => {
          stateData.eventTarget.dispatchEvent(new Event('change'))
        })
      }

      if (dispatch !== false) {
        stateData.eventTarget.dispatchEvent(new Event('change'));
      }

      return true
    }
  }

  return false;
}

export const useStateByName: GrootContextUseStateByName<Record<string, [any, boolean]>> = (name, defaultValue) => {
  if (!registorReady) {
    const message = `状态系统未准备就绪`
    console.error(message)
    throw new Error(message)
  }
  if (!stateMap.get(name) && (defaultValue === undefined)) {
    const message = `状态:${name} 未找到`;
    console.error(message)
    throw new Error(message)
  }

  const stateObj = stateMap.get(name);

  const [, refresh] = useReducer((tick) => ++tick, 0);

  useEffect(() => {
    stateObj?.eventTarget.addEventListener('change', () => {
      refresh();
    })
  }, [])

  return stateObj?.value || defaultValue
}


export const stateManager: StateManagerType = () => {
  return {
    registerState,
    setState,
    getState,
    useStateByName
  }
}

export const commandManager: CommandManagerType = () => {
  return {
    registerCommand,
    executeCommand
  }
}