import { useState } from "react";


const store = new Map<string, ModelContainer>();

/**
 * 注册模型实例
 * @param key 
 * @param model 
 */
export const registerModel = (key: string, model: any) => {
  if (store.has(key)) {
    throw new Error(`key:${key} not unique`);
  }

  store.set(key, {
    origin: model,
    fastUpdate: false,
    proxy: wrapper(key, model),
    execTrigger: false
  })
}

/**
 * 使用模型实例
 * @param key 
 * @returns [返回模型的代理对象, 主动更新的函数]
 */
export const useModel = <T>(key: string, isRoot = false): [T, (fun: Function, execTrigger?: boolean) => void] => {
  if (!store.has(key)) {
    throw new Error(`key:${key} not find`);
  }

  const [, trigger] = useState(0);

  const modelContainer = store.get(key)!;
  if (isRoot) {
    modelContainer.rootTrigger = trigger;
  }

  const updateAction = (fun: Function, execTrigger = true) => {
    modelContainer.fastUpdate = true;
    fun();
    modelContainer.fastUpdate = false;
    if (execTrigger) {
      autoTrigger(key);
    }
  }

  return [modelContainer.proxy, updateAction];
}


function wrapper(modelKey: string, target: any): any {
  return new Proxy(target, {
    get(oTarget, sKey, receiver) {
      const value = Reflect.get(oTarget, sKey, receiver);

      if (isBaseType(value)) {
        return value;
      } else if (Object.prototype.toString.apply(value) !== '[object Function]') {
        return wrapper(modelKey, value);
      }

      // 执行完函数自动执行视图更新操作
      return (...args: any[]) => {
        const modelContainer = store.get(modelKey)!;
        modelContainer.fastUpdate = true;
        const returnResult = Reflect.apply(value, oTarget, args);
        modelContainer.fastUpdate = false;

        if (oTarget.hasOwnProperty(sKey)) {
          autoTrigger(modelKey);
        }
        return returnResult;
      }
    },
    // 禁止直接更改代理对象的属性
    set(oTarget, sKey, vValue, receiver) {
      const modelContainer = store.get(modelKey)!;
      if (modelContainer.fastUpdate) {
        Reflect.set(oTarget, sKey, vValue, receiver);
        return true;
      }
      throw new Error('forbid set');
    },
    // 禁止直接删除代理对象的属性
    deleteProperty() {
      throw new Error('forbid delete');
    },
  })
}

function autoTrigger(modelKey: string) {
  const modelContainer = store.get(modelKey)!;
  modelContainer.execTrigger = true;
  Promise.resolve().then(() => {
    if (!modelContainer.execTrigger) {
      return;
    }

    modelContainer.rootTrigger!((tick: number) => {
      return ++tick;
    })
    modelContainer.execTrigger = false;
  });
}

const typeList = ['Number', 'String', 'Null', 'Undefined', 'Boolean', 'Symbol'];
function isBaseType(value: any) {
  const typeStr = Object.prototype.toString.apply(value);
  return typeList.some(type => typeStr.includes(type));
}

type ModelContainer = {
  proxy: any,
  origin: any,
  rootTrigger?: Function,
  fastUpdate: boolean,
  execTrigger: boolean
};