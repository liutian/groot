import { useEffect, useReducer, useState } from "react";
import { wrapperState } from "./reactive";

const store = new Map<string, ModelContainer>();
/**
 * 该状态管理库目的：
 * 1. 解决深层组件嵌套时状态传递问题
 * 2. 隐式自动视图刷新
 * 3. 逻辑代码和视图代码分离
 * 
 * 该状态管理的缺点：
 * 1. 仅支持单例模式
 * 2. 要主动管理模型间的依赖关系
 * 
 * 
 * 部分情况出于性能考虑，需要禁用视图更新，可以将要执行的模型方法调整为闭包模式，但是该方式还是无法阻止方法内部使用的外部模型属性和方法导致的自动刷新
*/
/**
 * 注册模型实例
 * @param modelClass 模型类
 * @returns 模型的代理对象 
 */
export const useRegisterModel = <T extends { emitter: Function }>(modelClass: ModelClass<T>): T => {
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
export const registerModel = <T extends { emitter: Function }>(modelClass: ModelClass<T>): () => void => {
  if (store.has(modelClass.modelName)) {
    throw new Error(`模块 ${modelClass.modelName} 已存在`);
  }

  const obj = new modelClass()
  obj.emitter = () => {
    launchDelay(modelClass.modelName)
  }
  store.set(modelClass.modelName, {
    proxy: wrapperState(obj, obj.emitter),
  });

  return () => {
    store.delete(modelClass.modelName);
  }
}

/**
 * 使用模型实例
 * @param modelClass 模型类
 * @returns 模型的代理对象
 */
export const useModel: UseModelFnType = <T extends { emitter: Function }>(modelClass: ModelClass<T>, isRoot = false): T => {
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

export type ModelClass<T extends { emitter: Function }> = (new () => T) & { modelName: string };

export type UseModelFnType = <T extends { emitter: Function }>(model: ModelClass<T>, isRoot?: boolean) => T;
