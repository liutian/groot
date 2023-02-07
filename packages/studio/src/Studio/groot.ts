import { ExtensionRuntime, GridLayout, GrootContextExecuteCommand, GrootContextGetState, GrootContextParams, GrootContextRegisterCommand, GrootContextRegisterState, GrootContextRegisterStateMulti, GrootContextRemoveState, GrootContextSetState, GrootContextUseStateByName, isBaseType, loadRemoteModule, MainType, wrapperState } from "@grootio/common"
import { useReducer, useState } from "react";
import request from "util/request";

let registorReady = false;
const commandMap = new Map<string, { thisArg?: any, callback: Function, provider: string }>();
let extensionList: ExtensionRuntime[] = [];
const stateMap = new Map<string, { value: any, provider: string, eventTarget: EventTarget, multi?: boolean }>();
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
        state: {
          registerState,
          setState,
          getState,
          registerStateMulti,
          removeState
        },
        command: {
          registerCommand,
          executeCommand
        },
        useStateByName,
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


const registerCommand: GrootContextRegisterCommand = (command, callback, thisArg?) => {
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

export const executeCommand: GrootContextExecuteCommand = (command, ...args) => {
  if (!registorReady) {
    throw new Error(`命令系统未准备就绪`)
  }
  if (!commandMap.has(command)) {
    throw new Error(`命令:${String(command)} 未找到`)
  }
  const { callback, thisArg } = commandMap.get(command);
  return callback.apply(thisArg, args);
}

const registerStateMulti: GrootContextRegisterStateMulti = (name, defaultValue = [], eventTarget = new EventTarget()) => {
  (defaultValue as any).__groot_multi = true;
  registerState(name, defaultValue, eventTarget);
}

const registerState: GrootContextRegisterState = (name, defaultValue, eventTarget = new EventTarget()) => {
  if (registorReady) {
    throw new Error('状态系统已准备完成，不可再次注册状态');
  }
  if (stateMap.has(name)) {
    console.warn(`状态:${name} 已存在`)
  }

  if ((defaultValue as any).__groot_multi) {
    stateMap.set(name, {
      value: defaultValue,
      provider: tempProvider,
      eventTarget,
      multi: true
    })
  } else {
    stateMap.set(name, {
      value: wrapperState(defaultValue, () => {
        eventTarget.dispatchEvent(new Event('change'))
      }),
      provider: tempProvider,
      eventTarget,
      multi: false
    });
  }
}

const getState: GrootContextGetState = (name) => {
  if (!stateMap.get(name)) {
    console.warn(`状态:${name} 未找到`)
  }

  const stateObj = stateMap.get(name);
  return stateObj.value;
}

const setState: GrootContextSetState = (name, newValue, dispatch) => {
  if (!registorReady) {
    throw new Error(`状态系统未准备就绪`)
  }
  if (!stateMap.get(name)) {
    throw new Error(`状态:${name} 未找到`)
  }

  const stateObj = stateMap.get(name);
  if (stateObj.multi) {
    const index = (stateObj.value as { id: string }[]).findIndex(item => item.id === newValue.id);
    if (index === -1) {
      stateObj.value.push(
        wrapperState(newValue, () => {
          stateObj.eventTarget.dispatchEvent(new Event('change'))
        })
      )
      if (dispatch !== false) {
        stateObj.eventTarget.dispatchEvent(new Event('change'));
      }
      return true;
    } else if (stateObj.value[index] !== newValue) {
      (stateObj.value as any[]).splice(index, 1, newValue);
      if (dispatch !== false) {
        stateObj.eventTarget.dispatchEvent(new Event('change'));
      }
      return true;
    }

  } else {
    if (newValue !== stateObj.value) {
      if (isBaseType(newValue)) {
        stateObj.value = newValue;
      } else {
        stateObj.value = wrapperState(newValue, () => {
          stateObj.eventTarget.dispatchEvent(new Event('change'))
        })
      }

      if (dispatch !== false) {
        stateObj.eventTarget.dispatchEvent(new Event('change'));
      }

      return true
    }
  }

  return false;
}

const removeState: GrootContextRemoveState = (name, id, dispatch) => {
  if (!registorReady) {
    throw new Error(`状态系统未准备就绪`)
  }
  if (!stateMap.get(name)) {
    throw new Error(`状态:${name} 未找到`)
  }

  const stateObj = stateMap.get(name);
  if (stateObj.multi) {
    const index = (stateObj.value as { id: string }[]).findIndex(item => item.id === id);
    if (index !== -1) {
      (stateObj.value as { id: string }[]).splice(index, 1);

      if (dispatch !== false) {
        stateObj.eventTarget.dispatchEvent(new Event('change'));
      }

      return true;
    }
  } else {
    throw new Error(`状态: ${name} 不是数组`)
  }

  return false;
}

export const useStateByName: GrootContextUseStateByName = (name, defaultValue) => {
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

  useState(() => {
    stateObj?.eventTarget.addEventListener('change', () => {
      refresh();
    })
  })

  return stateObj?.value || defaultValue
}