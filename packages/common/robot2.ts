import { ModelClass, UseModelFnType, wrapperState } from "@grootio/common";
import { useEffect, useReducer, useState } from "react";

const store = new Map<string, ModelContainer>();
/**
 * 该状态管理库目的：
 * 1. 解决深层组件嵌套时状态传递问题
 * 2. 隐式视图自动刷新
 * 3. 逻辑代码和视图代码分离
 * 
 * 该状态管理的缺点：
 * 1. 仅支持单例模式
 * 2. 要主动管理模型间的依赖关系
 * 3. 为了避免不必要的视图更新，需要严格区分状态模型类上的原型方法和实例方法，包括模型上挂载的任意对象
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
    throw new Error(`模块 ${modelClass.modelName} 已存在`);
  }

  store.set(modelClass.modelName, {
    proxy: wrapperState(new modelClass(), () => {
      launchDelay(modelClass.modelName)
    }),
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

  // const [, trigger] = useState(0);
  const [, trigger] = useReducer((tick) => ++tick, 0);

  const modelContainer = store.get(modelClass.modelName);
  if (isRoot) {
    modelContainer.rootTrigger = trigger;
  }

  return modelContainer.proxy;
}


function launchDelay(modelKey) {
  const modelContainer = store.get(modelKey);
  if (modelContainer.timeout) {
    window.clearTimeout(modelContainer.timeout);
  }

  modelContainer.timeout = window.setTimeout(() => {
    delete modelContainer.timeout;
    console.log(`robot trigger ${modelKey}`)
    modelContainer.rootTrigger()
  })
}

type ModelContainer = {
  proxy: any,
  rootTrigger?: Function,
  timeout?: number
};

