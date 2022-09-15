import { useEffect, useState } from "react";
import 'zone.js';
import { isBaseType } from "./utils";

const store = new Map<string, ModelContainer>();

let fastUpdate = false;

/**
 * 该状态管理库目的：
 * 1. 解决深层组件嵌套时状态传递问题
 * 2. 实现视图自动刷新
 * 3. 逻辑代码和视图代码分离
 * 
 * 该状态管理的缺点：
 * 1. 引入zoonjs，篡改浏览器原生方法
 * 2. 包裹异步方法，导致调用链过长
 * 3. 仅支持单例模式
 * 4. 要主动管理模型间的依赖关系
*/

/**
 * 注册模型实例
 * @param model 模型类
 * @returns [模型的代理对象, 主动更新的函数] 主动更新的函数可以不执行model方法的情况下更新model数据
 */
export const useRegisterModel = <T>(model: ModelClass<T>): ModelTuple<T> => {
  const [unregister] = useState(() => {
    return registerModel(model);
  });

  useEffect(() => {
    return unregister;
  }, []);

  return useModel(model, true);
}

/**
 * 注册模型实例
 * @param model 模型类
 * @returns 注销模型
 */
export const registerModel = <T>(model: ModelClass<T>): () => void => {
  if (store.has(model.modelName)) {
    throw new Error(`model ${model.modelName} have existed!`);
  }

  store.set(model.modelName, {
    origin: model,
    proxy: wrapper(model.modelName, new model()),
  });

  return () => {
    store.delete(model.modelName);
  }
}

/**
 * 使用模型实例，注意实例类型中方法必须为实例方法不能是原型方法
 * @param model 模型类
 * @returns [模型的代理对象, 主动更新的函数] 主动更新的函数可以不执行model方法的情况下更新model数据
 */
export const useModel = <T>(model: ModelClass<T>, isRoot = false): ModelTuple<T> => {
  if (!store.has(model.modelName)) {
    throw new Error(`model ${model.modelName} not find`);
  }

  const [, trigger] = useState(0);

  const modelContainer = store.get(model.modelName);
  if (isRoot) {
    modelContainer.rootTrigger = trigger;
  }

  const updateAction = (fun: Function, execTrigger = true) => {
    execInZone(model.modelName, 'updateAction', () => {
      fun();
    }, (asyncTaskName) => {
      // 少数情况之下updateAction只是想更新model，不刷新试图
      if (execTrigger) {
        autoTrigger(model.modelName, asyncTaskName);
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
        // React.Element不做任何处理
        if (value.$$typeof) {
          return value;
        }
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

type ModelContainer = {
  proxy: any,
  origin: any,
  rootTrigger?: Function,
};

type ModelClass<T> = (new () => T) & { modelName: string };

type ModelTuple<T> = [T, (fun: Function, execTrigger?: boolean) => void];