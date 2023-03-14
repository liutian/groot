import { CommandManager, ExtensionRuntime, GridLayout, GrootContextCallHook, GrootContextExecuteCommand, GrootContextGetState, GrootContextParams, GrootContextRegisterCommand, GrootContextRegisterHook, GrootContextRegisterState, GrootContextSetState, GrootContextUseStateByName, GrootContextWatchState, HookManager, isBaseType, loadRemoteModule, MainFunction, StateManager, wrapperState } from "@grootio/common"
import { useEffect, useReducer } from "react";
import request from "util/request";

const commandMap = new Map<string, CommandObject>();
const stateMap = new Map<string, StateObject>();
const hookMap = new Map<string, { preArgs?: any[], list: HookObject[] }>();
const contextEventTarget = new EventTarget();
let extensionList: ExtensionRuntime[] = [];
let registorReady = false;
let tempProvider = ''
let extIdTick = 0;

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
    .then((mainList: MainFunction<any>[]) => {
      return remoteExtensionList.map(({ packageName, packageUrl, name, config }, index) => {
        return { packageName, packageUrl, main: mainList[index], config, name }
      })
    })
}

export const launchExtension = (remoteExtensionList: ExtensionRuntime[], params: GrootContextParams, layout: GridLayout) => {
  const configSchemaList = [];
  remoteExtensionList.forEach(({ name, main, packageName, packageUrl, config }, index) => {
    const requestClone = request.clone((type) => {
      if (type === 'request') {
        console.log(`[${extensionList[index].packageName} request]`);
      }
    });

    tempProvider = packageName;
    const configSchema = main({
      extName: name,
      extPackageName: packageName,
      extPackageUrl: packageUrl,
      extConfig: config,
      request: requestClone,
      groot: {
        params,
        layout,
        stateManager,
        commandManager,
        hookManager,
        onReady: function (listener) {
          contextEventTarget.addEventListener('ready', listener);
        }
      }
    });
    tempProvider = undefined;

    extensionList.push(Object.assign({
      name,
      packageName,
      packageUrl,
      main,
      config
    }, { id: ++extIdTick }))

    configSchemaList.push({ ...configSchema, id: ++extIdTick });
  });

  registerState('gs.extension.configSchemaList', Object.freeze(configSchemaList) as any, true);
  registerState('gs.extension.dataList', Object.freeze(extensionList) as any, true);
  registorReady = true;
  layout.refresh()
  contextEventTarget.dispatchEvent(new Event('ready'));
}


const registerCommand: GrootContextRegisterCommand<Record<string, [any[], any]>> = (command, callback) => {
  if (registorReady) {
    throw new Error('命令系统已准备完成，不可再次注册命令');
  }
  let originCommand;
  if (commandMap.has(command)) {
    originCommand = commandMap.get(command);
    console.warn(`命令:${String(command)} 已经存在`);
  }
  commandMap.set(command, {
    callback,
    provider: tempProvider,
    origin: originCommand
  });
  return () => {
    if (commandMap.has(command) && commandMap.get(command).callback !== callback) {
      console.warn(`命令:${String(command)} 已经被覆盖`)
    } else {
      commandMap.delete(command);
    }
  }
}

export const executeCommand: GrootContextExecuteCommand<Record<string, [any[], any]>> = (command, ...args) => {
  if (!registorReady) {
    throw new Error(`命令系统未准备就绪`)
  }
  if (!commandMap.has(command)) {
    throw new Error(`命令:${String(command)} 未找到`)
  }
  const commandData = commandMap.get(command);
  const { callback, origin } = commandData
  const originCommand = origin || (() => undefined);
  const result = callback.apply(null, [originCommand, ...args]);
  // todo hookName
  return result;
}


const registerState: GrootContextRegisterState<Record<string, [any, boolean]>> = (name, defaultValue, multi, onChange) => {
  if (registorReady) {
    throw new Error('状态系统已准备完成，不可再次注册状态');
  }

  const eventTarget = new EventTarget();
  eventTarget.addEventListener('change', () => {
    const newValue = stateMap.get(name).value
    onChange && onChange(newValue);
  })

  const stateValue = wrapperState(defaultValue, () => {
    eventTarget.dispatchEvent(new Event('change'))
  })

  const overwrite = stateMap.has(name);

  stateMap.set(name, {
    value: stateValue,
    provider: tempProvider,
    eventTarget,
    multi
  });

  if (overwrite) {
    console.warn(`状态:${name} 已被覆盖`);
  }

  return overwrite;
}

const getState: GrootContextGetState<Record<string, [any, boolean]>> = (name) => {
  if (!stateMap.get(name)) {
    console.warn(`状态:${name} 未找到`)
  }

  const stateData = stateMap.get(name);
  return stateData.value;
}

const watchState: GrootContextWatchState<Record<string, [any, boolean]>> = (name, callback) => {
  if (!stateMap.get(name)) {
    console.warn(`状态:${name} 未找到`)
  }

  const stateData = stateMap.get(name);
  const listener = () => {
    callback(stateData.value);
  }
  stateData.eventTarget.addEventListener('change', listener)

  return () => {
    stateData.eventTarget.removeEventListener('change', listener)
  }
}

const setState: GrootContextSetState<Record<string, [any, boolean]>> = (name, newValue) => {
  if (!registorReady) {
    throw new Error(`状态系统未准备就绪`)
  }
  if (!stateMap.get(name)) {
    throw new Error(`状态:${name} 未找到`)
  }

  const stateData = stateMap.get(name);
  if (stateData.multi) {
    stateData.value.length = 0;
    if (Array.isArray(newValue)) {
      newValue.forEach((item) => {
        stateData.value.push(item);
      })
    }
    stateData.eventTarget.dispatchEvent(new Event('change'))
  } else if (newValue !== stateData.value) {
    if (isBaseType(newValue)) {
      stateData.value = newValue;
    } else {
      stateData.value = wrapperState(newValue, () => {
        stateData.eventTarget.dispatchEvent(new Event('change'))
      })
    }
    stateData.eventTarget.dispatchEvent(new Event('change'))
  }

  return stateData.value;
}

export const useStateByName: GrootContextUseStateByName<Record<string, [any, boolean]>> = (name, defaultValue) => {
  if (!registorReady) {
    const message = `状态系统未准备就绪`
    console.error(message)
    throw new Error(message)
  }
  if (!stateMap.has(name) && (defaultValue === undefined)) {
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


  return [
    stateObj?.value || defaultValue,
    (newValue) => {
      return setState(name, newValue);
    }
  ]
}

export const registerHook: GrootContextRegisterHook<Record<string, [any[], any]>> = (hookName, callback, emitPrevArgs = false) => {
  const hook = getOrCreateHook(hookName)

  if (hook.list.find(item => item.callback === callback)) {
    throw new Error('钩子函数重复注册')
  }

  hook.list.push({
    callback,
    provider: tempProvider
  })

  if (emitPrevArgs && hook.preArgs) {
    callback.apply(null, hook.preArgs as any)
  }

  return () => {
    const index = hook.list.findIndex(item => item.callback === callback);
    if (index !== -1) {
      hook.list.splice(index, 1);
    }
  }
}

export const callHook: GrootContextCallHook<Record<string, [any[], any]>> = (hookName, ...args) => {

  let hook = getOrCreateHook(hookName)
  hook.preArgs = args

  return hook.list.map((item) => {
    return item.callback.apply(null, args);
  })

}

const getOrCreateHook = (hookName: string) => {
  let hook = hookMap.get(hookName)
  if (!hook) {
    hook = {
      list: []
    }
    hookMap.set(hookName, hook);
  }

  return hook
}

export const stateManager: StateManager = () => {
  return {
    registerState,
    setState,
    getState,
    useStateByName,
    watchState
  }
}

export const commandManager: CommandManager = () => {
  return {
    registerCommand,
    executeCommand
  }
}

export const hookManager: HookManager = () => {
  return {
    registerHook,
    callHook
  }
}


type CommandObject = { callback: Function, provider: string, origin?: CommandObject }
type StateObject = { value: any, provider: string, eventTarget: EventTarget, multi: boolean }
type HookObject = { callback: Function, provider: string }
