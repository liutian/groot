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
                newArgs = []
                // 必须强制控制数组项，否则浏览器原始实现会误判，导致执行结果非预期
                if (args[0] !== undefined) {
                  newArgs.push(args[0])
                }
                if (args[1] !== undefined) {
                  newArgs.push(args[1])
                }
                if (insertItems.length) {
                  newArgs.push(...insertItems)
                }
                break
            }

            const result = Reflect.apply(value, oTarget, newArgs);
            listener();
            return result;
          }
        }

        if (sKey === '__groot_target') {
          // 处理外部拿代理对象比对相等时总是为false的问题
          return () => oTarget
        } else {
          // 非特殊数组函数外直接this指向
          return value.bind(receiver);
        }

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