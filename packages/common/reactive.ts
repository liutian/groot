import { isBaseType } from './util';


const ArrayPatchMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill'];

export function wrapperState(target: any, listener: Function) {
  const targetTypeStr = Object.prototype.toString.apply(target);
  if (isBaseType(target) || targetTypeStr === '[object Function]' || targetTypeStr === '[object AsyncFunction]' || target.$$typeof) {
    return target;
  }

  return new Proxy(target, {
    get(oTarget, sKey, receiver) {
      const value = Reflect.get(oTarget, sKey);

      const typeStr = Object.prototype.toString.apply(value);
      // 基本数据类型直接放行
      if (isBaseType(value)) {
        return value;
      } else if (typeStr === '[object Function]' || typeStr === '[object AsyncFunction]') {
        if (Array.isArray(oTarget) && typeof sKey === 'string' && ArrayPatchMethods.includes(sKey)) {
          return (...args: any[]) => {
            let newArgs = args;
            switch (sKey) {
              case 'push':
              case 'unshift':
                newArgs = args.map(item => wrapperState(item, listener))
                break
              case 'splice':
                const insertItems = args.slice(2).map(item => wrapperState(item, listener));
                newArgs = [args[0], args[1], ...insertItems]
                break
            }

            const result = Reflect.apply(value, oTarget, newArgs);
            listener();
            return result;
          }
        }

        // 非特殊数组函数外直接this指向
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
      const origin = Reflect.get(oTarget, sKey);
      const result = Reflect.set(oTarget, sKey, vValue);
      if (origin !== Reflect.get(oTarget, sKey)) {
        listener();
      }
      return result;
    },
    deleteProperty(oTarget, sKey) {
      const origin = Reflect.get(oTarget, sKey);
      const result = Reflect.deleteProperty(oTarget, sKey);
      if (origin !== Reflect.get(oTarget, sKey)) {
        listener();
      }
      return result;
    },
  })
}