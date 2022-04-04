import { useEffect, useState } from "react";

const store = new Map<string, { proxy: any, target: any, triggerList: Function[] }>();

/**
 * 注册模型实例
 * @param key 
 * @param target 
 */
export const registerModel = (key: string, target: any) => {
  if (store.has(key)) {
    throw new Error(`key:${key} not unique`);
  }

  store.set(key, {
    target,
    proxy: wrapper(key, target),
    triggerList: []
  })
}

/**
 * 使用模型实例
 * @param key 
 * @returns 
 */
export const useModel = <T>(key: string): T => {
  if (!store.has(key)) {
    throw new Error(`key:${key} not find`);
  }

  const [, refresh] = useState(0);

  const modelData = store.get(key);

  useEffect(() => {
    modelData?.triggerList.push(refresh);
    return () => {
      const triggerIndex = modelData?.triggerList.indexOf(refresh)!;
      modelData?.triggerList.splice(triggerIndex, 1);
    }
  })


  return modelData?.proxy;
}


function wrapper(key: string, target: any): any {
  return new Proxy(target, {
    get(oTarget, sKey) {
      const value = oTarget[sKey] || undefined;
      if (Object.prototype.toString.apply(value) === '[object Function]') {
        return (...args: any[]) => {
          Reflect.apply(value, target, args);
          store.get(key)?.triggerList.forEach((trigger) => {
            trigger((tick: number) => {
              return ++tick;
            })
          });
        }
      }

      return value;
    }
  })
}
