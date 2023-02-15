import { isBaseType } from './util';


const ArrayPatchMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill'];



export function wrapperState(target: any, listener: Function) {

  // 避免不必类型的包装
  if (isBaseType(target) || typeof target === 'function' || target.$$typeof) {
    return target;
  }

  // 防止重复多余的包装
  if (target.__groot_origin_listener === listener) {
    return target;
  }

  ++wrapCount
  return new Proxy(target, {
    get(oTarget, sKey, receiver) {
      // 原生内置方法调用或者react dom对象跳过
      if (typeof sKey === 'symbol' || sKey === '$$typeof' || sKey === 'constructor') {
        return Reflect.get(oTarget, sKey);
      } else if (sKey === '__groot_origin') {
        return oTarget;
      } else if (sKey === '__groot_origin_listener') {
        return listener
      }

      ++getCount;
      if (!keyState[sKey]) {
        keyState[sKey] = 1;
      } else {
        keyState[sKey]++;
      }

      const value = Reflect.get(oTarget, sKey);
      // 基本数据类型直接放行
      if (isBaseType(value)) {
        return value;
      }

      if (typeof value === 'function') {

        // 拦截可以改变数组自身的方法
        if (Array.isArray(oTarget) && ArrayPatchMethods.includes(sKey)) {
          return (...args: any[]) => {
            let newArgs = args;
            // switch (sKey) {
            //   case 'push':
            //   case 'unshift':
            //     newArgs = args.map(item => wrapperState(item, listener))
            //     break
            //   case 'splice':
            //     const insertItems = args.slice(2).map(item => wrapperState(item, listener));
            //     newArgs = []
            //     // 必须强制控制数组项，否则浏览器原始实现会误判，导致执行结果非预期
            //     if (args[0] !== undefined) {
            //       newArgs.push(args[0])
            //     }
            //     if (args[1] !== undefined) {
            //       newArgs.push(args[1])
            //     }
            //     if (insertItems.length) {
            //       newArgs.push(...insertItems)
            //     }
            //     break
            // }

            const result = Reflect.apply(value, receiver, newArgs);
            listener();
            return result;
          }
        }

        return value.bind(receiver);

      } else {
        // React.Element不做任何处理
        if (value.$$typeof) {
          return value;
        }
        // 除函数之外引用应用类型需要递归包裹生成代理对象
        return wrapperState(value, listener);
      }
    },
    set(oTarget, sKey, vValue) {
      ++setCount;
      const result = Reflect.set(oTarget, sKey, vValue);
      listener();
      return result;
    },
    deleteProperty(oTarget, sKey) {
      ++setCount;
      const result = Reflect.deleteProperty(oTarget, sKey);
      listener();
      return result;
    },
  })
}


export const getOrigin = (target) => {
  let data = target;
  while (data && data.__groot_origin) {
    data = data.__groot_origin
  }

  if (data && Array.isArray(data)) {
    return data.map(item => getOrigin(item))
  }

  return data;
}


let getCount = 0;
let setCount = 0;
let wrapCount = 0;
let keyState = {};
let debug = false
if (debug) {
  const monitor = () => {
    console.log(`getCount: ${getCount}`)
    console.log(`setCount: ${setCount}`)
    console.log(`wrapCount: ${wrapCount}`)
    console.dir(keyState)

    setTimeout(monitor, 3000)
  }

  monitor();
}