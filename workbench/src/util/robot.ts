import { useState } from "react";
import 'zone.js';

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
    // execTrigger: false
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

    execInZone(key, 'updateAction', () => {
      fun();
    }, (asyncTaskName) => {
      if (execTrigger) {
        autoTrigger(key, asyncTaskName);
      }
    })
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
        let returnResult = execInZone(modelKey, 'default', () => {
          return Reflect.apply(value, oTarget, args);
        }, (asyncTaskName) => {
          if (oTarget.hasOwnProperty(sKey)) {
            autoTrigger(modelKey, asyncTaskName);
          }
        })

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

function autoTrigger(modelKey: string, asyncTaskName?: string) {
  const modelContainer = store.get(modelKey)!;
  console.log(`robot trigger ${asyncTaskName ? `[${asyncTaskName}]` : ''}: ${modelKey}`)
  modelContainer.rootTrigger!((tick: number) => {
    return ++tick;
  })

}

function execInZone(modelKey: string, type: string, runFn: Function, triggerFn: (asyncTaskName?: string) => void) {
  let resultOfRun;
  const modelContainer = store.get(modelKey)!;

  Zone.current.fork({
    name: `robot-${type}-${modelKey}`,
    onInvokeTask: (delegate, _currentZone, targetZone, task, ...args) => {
      modelContainer.fastUpdate = true;
      const result = delegate.invokeTask(targetZone, task, ...args);
      modelContainer.fastUpdate = false;

      triggerFn(task.source);

      return result;
    }
  }).run(() => {
    modelContainer.fastUpdate = true;
    resultOfRun = runFn();
    modelContainer.fastUpdate = false;

    triggerFn();
  })

  return resultOfRun;
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
  // execTrigger: boolean
};