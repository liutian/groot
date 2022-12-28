import { ModelClass, UseModelFnType } from "@grootio/common";
import { useEffect, useState } from "react";

const store = new Map<string, ModelContainer>();
let activeModelKey = '';
const ArrayPatchMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
/**
 * 该状态管理库目的：
 * 1. 解决深层组件嵌套时状态传递问题
 * 2. 实现视图自动刷新
 * 3. 逻辑代码和视图代码分离
 * 
 * 该状态管理的缺点：
 * 1. 篡改浏览器原生方法
 * 2. 仅支持单例模式
 * 3. 要主动管理模型间的依赖关系
 * 4. 为了避免不必要的视图更新，需要严格区分状态模型类上的原型方法和实例方法，包括模型上挂载的任意对象
*/

/**
 * 注册模型实例
 * @param modelClass 模型类
 * @returns [模型的代理对象, 主动更新的函数] 主动更新的函数可以不执行model方法的情况下更新model数据
 */
export const useRegisterModel = <T>(modelClass: ModelClass<T>): T => {
  const [unregister] = useState(() => {
    return registerModel(modelClass);
  });

  useEffect(() => {
    return unregister;
  }, []);

  return useModel(modelClass, true);
}

/**
 * 注册模型实例
 * @param modelClass 模型类
 * @returns 注销模型
 */
export const registerModel = <T>(modelClass: ModelClass<T>): () => void => {
  if (store.has(modelClass.modelName)) {
    throw new Error(`model ${modelClass.modelName} have existed!`);
  }

  store.set(modelClass.modelName, {
    proxy: wrapper(modelClass.modelName, new modelClass()),
  });

  return () => {
    store.delete(modelClass.modelName);
  }
}

/**
 * 使用模型实例，注意实例类型中方法必须为实例方法不能是原型方法
 * @param modelClass 模型类
 * @returns 模型的代理对象
 */
export const useModel: UseModelFnType = <T>(modelClass: ModelClass<T>, isRoot = false): T => {
  if (!store.has(modelClass.modelName)) {
    throw new Error(`model ${modelClass.modelName} not find`);
  }

  const [, trigger] = useState(0);

  const modelContainer = store.get(modelClass.modelName);
  if (isRoot) {
    modelContainer.rootTrigger = trigger;
  }

  return modelContainer.proxy;
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

      const typeStr = Object.prototype.toString.apply(value);
      // 基本数据类型直接放行
      if (isBaseType(value)) {
        return value;
      } else if (typeStr !== '[object Function]' && typeStr !== '[object AsyncFunction]') {
        // React.Element不做任何处理
        if (value.$$typeof) {
          return value;
        }
        // 除函数之外引用数据类型需要递归包裹生成代理对象
        return wrapper(modelKey, value);
      }

      // 模型实例方法执行之后自动进行视图更新
      return (...args: any[]) => {
        if (Array.isArray(oTarget) && typeof sKey === 'string' && ArrayPatchMethods.includes(sKey)) {
          launchTimeout(modelKey);
          let newArgs = args;
          switch (sKey) {
            case 'push':
            case 'unshift':
              newArgs = args.map(item => wrapper(modelKey, item))
              break
            case 'splice':
              newArgs = [args[0], args[1], args.slice(2).map(item => wrapper(modelKey, item))]
              break
          }

          return Reflect.apply(value as any, oTarget, newArgs);
        } else if (!oTarget.hasOwnProperty(sKey)) {
          return Reflect.apply(value, oTarget, args);
        }

        launchTimeout(modelKey);
        activeModelKey = modelKey;
        const result = Reflect.apply(value, oTarget, args);
        return result
      }
    },
    set(oTarget, sKey, vValue, receiver) {
      launchTimeout(modelKey);
      return Reflect.set(oTarget, sKey, vValue, receiver);
    },
    deleteProperty(oTarget, sKey) {
      launchTimeout(modelKey);
      return Reflect.deleteProperty(oTarget, sKey);
    },
  })
}

function launchTimeout(modelKey) {
  const modelContainer = store.get(modelKey)!;
  if (modelContainer.timeout) {
    globalThis.clearTimeout(modelContainer.timeout);
  }

  modelContainer.timeout = globalThis['originTimeout'](() => {
    delete modelContainer.timeout;
    console.log(`robot trigger ${modelKey}`)
    modelContainer.rootTrigger!((tick: number) => {
      return ++tick;
    })
  })
}

type ModelContainer = {
  proxy: any,
  rootTrigger?: Function,
  timeout?: number
};


const typeList = ['Number', 'String', 'Null', 'Undefined', 'Boolean', 'Symbol', 'BigInt'];
export const isBaseType = (value: any) => {
  const typeStr = Object.prototype.toString.apply(value);
  return typeList.some(type => typeStr.includes(type));
}


if (globalThis.XMLHttpRequest) {
  if (!globalThis['originXHR']) {
    globalThis['originXHR'] = globalThis.XMLHttpRequest;
  }

  (globalThis as any).XMLHttpRequest = function () {
    let currModelKey
    const xhr = new globalThis['originXHR']();

    for (let attr in xhr) {
      if (Object.prototype.toString.call(xhr[attr]) === '[object Function]') {
        this[attr] = function (...args) {
          if (attr === 'send') {
            currModelKey = activeModelKey;
          }
          return xhr[attr].apply(xhr, args);
        }
      } else {
        Object.defineProperty(this, attr, {
          get: function () {
            return xhr[attr];
          },
          set: function (newValue) {
            if (attr === 'onloadend') {
              xhr[attr] = function (...args) {
                if (currModelKey) {
                  launchTimeout(currModelKey);
                }
                return newValue.apply(xhr, args);
              }
            } else {
              xhr[attr] = newValue;
            }
          },
          enumerable: true
        })
      }
    }
  }
}


if (globalThis.fetch) {
  if (!globalThis['originFetch']) {
    globalThis['originFetch'] = globalThis.fetch;
  }

  (globalThis as any).fetch = function (...args) {
    const currModelKey = activeModelKey;
    return new Promise((resolve, reject) => {
      globalThis['originFetch'].apply(null, args as any).then((res) => {
        if (currModelKey) {
          launchTimeout(currModelKey);
        }
        resolve(res);
      }, (error) => {
        if (currModelKey) {
          launchTimeout(currModelKey);
        }
        reject(error);
      })
    })
  }
}

if (globalThis.setTimeout) {
  if (!globalThis['originTimeout']) {
    globalThis['originTimeout'] = globalThis.setTimeout;
  }


  // function _setTimeout(...args) {
  //   const currModelKey = activeModelKey;
  //   const fn = args[0];
  //   args[0] = function (...params) {
  //     if (currModelKey) {
  //       activeModelKey = null;
  //       launchTimeout(currModelKey);
  //     }
  //     fn.apply(null, params)
  //   }
  //   return globalThis['originTimeout'].apply(null, args);
  // }

  // (window as any).setTimeout = _setTimeout;

}
