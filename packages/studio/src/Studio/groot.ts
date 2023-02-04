import { GrootContextExecuteCommand, GrootContextRegisterCommand } from "@grootio/common"

const commandMap = new Map<string | symbol, { thisArg?: any, callback: Function }>();

let commandReady = false;
export const commandRegisterReady = () => {
  commandReady = true;
}

export const registerCommand: GrootContextRegisterCommand = (command, callback, thisArg?) => {
  if (commandReady) {
    throw new Error('命令系统已准备完成，不可再次注册命令');
  }
  if (commandMap.has(command)) {
    console.warn(`命令:${String(command)} 已经存在`);
  }
  commandMap.set(command, {
    callback,
    thisArg
  });
  return () => {
    if (commandMap.has(command) && commandMap.get(command).callback !== callback) {
      console.warn(`命令:${String(command)} 已经被覆盖`)
    }
    commandMap.delete(command);
  }
}

export const executeCommand: GrootContextExecuteCommand = (command, ...args) => {
  if (!commandMap.has(command)) {
    throw new Error(`命令:${String(command)} 未找到`)
  }
  const { callback, thisArg } = commandMap.get(command);
  return callback.apply(thisArg, args);
}