import { useEffect, useState } from "react";
import 'zone.js';

const store = new Map<string, ModelContainer>();

let fastUpdate = false;

/**
 * 注册模型实例
 * @param key 模型名称
 * @param model 模型实例
 * @returns [模型的代理对象, 主动更新的函数]
 */
export const useRegisterModel = <T>(key: string, model: T) => {
  const [unregister] = useState(() => {
    return registerModel(key, model);
  });

  useEffect(() => {
    return unregister;
  }, []);

  return useModel<T>(key, true);
}

/**
 * 注册模型实例
 * @param key 模型名称
 * @param model 模型实例
 */
export const registerModel = (key: string, model: any) => {
  if (store.has(key)) {
    throw new Error(`model ${key} have existed!`);
  }

  store.set(key, {
    origin: model,
    proxy: wrapper(key, model),
  });

  return () => {
    store.delete(key);
  }
}

/**
 * 使用模型实例，注意实例类型定义中方法必须为实例方法不能是原型方法
 * @param key 实例名称
 * @returns [模型的代理对象, 主动更新的函数] 主动更新的函数可以不执行model方法的情况下更新model数据
 */
export const useModel = <T>(key: string, isRoot = false): [T, (fun: Function, execTrigger?: boolean) => void] => {
  if (!store.has(key)) {
    throw new Error(`model ${key} not find`);
  }

  const [, trigger] = useState(0);

  const modelContainer = store.get(key);
  if (isRoot) {
    modelContainer.rootTrigger = trigger;
  }

  const updateAction = (fun: Function, execTrigger = true) => {
    execInZone(key, 'updateAction', () => {
      fun();
    }, (asyncTaskName) => {
      // 少数情况之下updateAction只是想更新model，不刷新试图
      if (execTrigger) {
        autoTrigger(key, asyncTaskName);
      }
    })
  }

  return [modelContainer.proxy, updateAction];
}

/**
 * 根据模型实例生成对应代理对象
 * @param modelKey 模型名称
 * @param target 模型实例
 * @returns 模型实例代理对象
 */
function wrapper(modelKey: string, target: any): any {
  return new Proxy(target, {
    get(oTarget, sKey, receiver) {
      const value = Reflect.get(oTarget, sKey, receiver);

      // 基本数据类型直接放行
      if (isBaseType(value)) {
        return value;
      } else if (Object.prototype.toString.apply(value) !== '[object Function]') {
        // 除函数之外引用数据类型需要递归包裹生成代理对象
        return wrapper(modelKey, value);
      }

      // 模型实例方法执行之后自动进行视图更新
      return (...args: any[]) => {
        let returnResult = execInZone(modelKey, 'default', () => {
          return Reflect.apply(value, oTarget, args);
        }, (asyncTaskName) => {
          // 只有模型实例对象上的方法可以自动更新视图，原型中的方法禁止更新（数组map方法执行之后更新视图会造成视图更新死循环）
          if (oTarget.hasOwnProperty(sKey)) {
            autoTrigger(modelKey, asyncTaskName);
          }
        })

        return returnResult;
      }
    },
    // 禁止直接更改代理对象的属性
    set(oTarget, sKey, vValue, receiver) {
      if (fastUpdate) {
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

/**
 * 异步任务回掉函数中的模型数据的更新
 * @param modelKey 模型名称
 * @param type 类型
 * @param runFn 首次执行函数
 * @param triggerFn 视图更新函数
 * @returns 首次执行函数返回结果
 */
function execInZone(modelKey: string, type: string, runFn: Function, triggerFn: (asyncTaskName?: string) => void) {
  let resultOfRun;
  Zone.current.fork({
    name: `robot-${type}-${modelKey}`,
    onInvokeTask: (delegate, _currentZone, targetZone, task, ...args) => {
      const forceFalse = fastUpdate !== true;
      fastUpdate = true;
      const result = delegate.invokeTask(targetZone, task, ...args);
      if (forceFalse) {
        fastUpdate = false;
      }

      triggerFn(task.source);

      return result;
    }
  }).run(() => {
    const forceFalse = fastUpdate !== true;
    fastUpdate = true;
    resultOfRun = runFn();
    if (forceFalse) {
      fastUpdate = false;
    }

    triggerFn();
  })

  return resultOfRun;
}

const typeList = ['Number', 'String', 'Null', 'Undefined', 'Boolean', 'Symbol', 'BigInt'];
function isBaseType(value: any) {
  const typeStr = Object.prototype.toString.apply(value);
  return typeList.some(type => typeStr.includes(type));
}

type ModelContainer = {
  proxy: any,
  origin: any,
  rootTrigger?: Function,
};