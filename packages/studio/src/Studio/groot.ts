import { ExtensionRuntime, GridLayout, GrootContextExecuteCommand, GrootContextGetState, GrootContextParams, GrootContextRegisterCommand, GrootContextRegisterState, GrootContextSetState, GrootContextUseStateByName, isBaseType, loadRemoteModule, MainType, wrapperState } from "@grootio/common"
import { useReducer, useState } from "react";
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
        states: {
          registerState,
          setState,
          getState
        },
        commands: {
          registerCommand,
          executeCommand
        },
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


const registerState: GrootContextRegisterState = (name, eventTarget = new EventTarget(), defaultValue) => {
  if (registorReady) {
    throw new Error('状态系统已准备完成，不可再次注册状态');
  }
  if (stateMap.has(name)) {
    console.warn(`状态:${name} 已存在`)
  }

  if (isBaseType(defaultValue) && defaultValue !== undefined) {
    stateMap.set(name, {
      value: wrapperState(defaultValue, () => {
        eventTarget.dispatchEvent(new Event('change'))
      }),
      provider: tempProvider,
      eventTarget
    });
  } else {
    stateMap.set(name, {
      value: undefined,
      provider: tempProvider,
      eventTarget
    })
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
    new Error(`状态:${name} 未找到`)
  }

  const stateObj = stateMap.get(name);
  if (newValue !== stateObj.value) {
    if (isBaseType(newValue) && newValue !== undefined) {
      stateObj.value = newValue;
    } else {
      stateObj.value = wrapperState(newValue, () => {
        stateObj.eventTarget.dispatchEvent(new Event('change'))
      })
    }

    if (dispatch !== false) {
      stateObj.eventTarget.dispatchEvent(new Event('change'));
    }
  }
}

export const useStateByName: GrootContextUseStateByName = (name) => {
  if (!stateMap.has(name)) {
    throw new Error(`状态未准备就绪`)
  }

  const stateObj = stateMap.get(name);

  const [, refresh] = useReducer((tick) => ++tick, 0);

  useState(() => {
    stateObj.eventTarget.addEventListener('change', () => {
      refresh();
    })
  })

  return stateObj.value
}