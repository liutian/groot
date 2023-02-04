import { ExtensionRuntime, GrootContextExecuteCommand, GrootContextRegisterCommand, loadRemoteModule, MainType, StudioMode } from "@grootio/common"
import request from "util/request";

const commandMap = new Map<string, { thisArg?: any, callback: Function, provider: string }>();
const extensionList: ExtensionRuntime[] = [];
let commandReady = false;
let studioMode: StudioMode;

export const loadExtension = (remoteExtensionList: { key: string, url: string }[], mode: StudioMode) => {
  studioMode = mode;
  return Promise.all(remoteExtensionList.map(item => {
    return loadRemoteModule(item.key, 'Main', item.url);
  }))
    .then(
      moduleList => moduleList.map(m => m.default),
      (error) => {
        console.error('加载插件失败');
        return Promise.reject(error);
      })
    .then((mainList: MainType[]) => {
      const extensionConfigList = parseExtensionConfig(mainList);
      remoteExtensionList.forEach(({ key, url }, index) => {
        extensionList.push({
          key,
          url,
          main: mainList[index],
          config: extensionConfigList[index]
        })
      })
      return extensionList;
    })
}

const parseExtensionConfig = (mainList: MainType[]) => {
  const configList = mainList.map((main, index) => {
    const requestClone = request.clone((type) => {
      if (type === 'request') {
        console.log(`[${extensionList[index].key} request]`);
      }
    });

    const extensionConfig = main({
      request: requestClone,
      groot: {
        commands: {
          registerCommand: (command, callback, thisArg) => {
            const disposable = registerCommand(command, callback, thisArg);
            commandMap.get(command).provider = command;
            return disposable;
          },
          executeCommand: (command, ...args) => {
            return executeCommand(command, ...args);
          }
        }
      }
    });

    return extensionConfig;
  });

  commandReady = true;
  return configList;
}

const registerCommand: GrootContextRegisterCommand = (command, callback, thisArg?) => {
  if (commandReady) {
    throw new Error('命令系统已准备完成，不可再次注册命令');
  }
  if (commandMap.has(command)) {
    console.warn(`命令:${String(command)} 已经存在`);
  }
  commandMap.set(command, {
    callback,
    thisArg,
    provider: ''
  });
  return () => {
    if (commandMap.has(command) && commandMap.get(command).callback !== callback) {
      console.warn(`命令:${String(command)} 已经被覆盖`)
    }
    commandMap.delete(command);
  }
}

const executeCommand: GrootContextExecuteCommand = (command, ...args) => {
  if (!commandMap.has(command)) {
    throw new Error(`命令:${String(command)} 未找到`)
  }
  const { callback, thisArg } = commandMap.get(command);
  return callback.apply(thisArg, args);
}