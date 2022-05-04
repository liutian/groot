import { wrap } from '@mikro-orm/core';
import { AutoPath } from '@mikro-orm/core/typings';

export function omitProps<O, P extends string>(instance: O, propKeys: AutoPath<O, P>[]) {
  const stripKeysOfObj = new Map();

  for (let i = 0; i < propKeys.length; i++) {
    const stageKeys = propKeys[i].split('.');
    let context: any = instance;

    let indexOfStageKeysStack = [];
    let arrayContextStack = [];
    // 数组迭代的索引
    let arrayContextIndexStack = [];

    let currcArrayContextIndex = -1;
    let currArrayContext;
    let currIndexOfStageKeys = -1;
    for (let indexOfStageKeys = 0; indexOfStageKeys < stageKeys.length; indexOfStageKeys++) {
      const key = stageKeys[indexOfStageKeys];

      // 最后一个属性
      if (indexOfStageKeys === stageKeys.length - 1) {
        if (stripKeysOfObj.has(context)) {
          stripKeysOfObj.get(context).push(key);
        } else {
          stripKeysOfObj.set(context, [key]);
        }

        // 属性上层有数组结构
        if (currArrayContext) {
          // 数组最后一个
          if (currcArrayContextIndex === currArrayContext.length - 1) {
            currIndexOfStageKeys = indexOfStageKeysStack.pop();
            currArrayContext = arrayContextStack.pop();
            currcArrayContextIndex = arrayContextIndexStack.pop();

            // 最终
            if (!currArrayContext) {
              continue;
            }
          }

          context = currArrayContext[++currcArrayContextIndex];
          indexOfStageKeys = currIndexOfStageKeys;
        }

        continue;
      }

      context = context[key];

      // 数组
      if (Number.isInteger(context.length)) {
        if (currArrayContext) {
          arrayContextStack.push(currArrayContext);
          arrayContextIndexStack.push(currcArrayContextIndex);
          indexOfStageKeysStack.push(currIndexOfStageKeys);
        }

        currArrayContext = context;
        currcArrayContextIndex = 0;
        currIndexOfStageKeys = indexOfStageKeys;

        context = currArrayContext[currcArrayContextIndex];
      }

    }
  }

  stripKeysOfObj.forEach((keys, obj) => {
    obj.toJSON = wrapToJSON(keys);
  })
}


function wrapToJSON(keys: string) {
  function toJSON(strict = true, stripKeys: string[] = [], ...args: any[]) {
    const obj = wrap(this, true).toObject(...args);

    if (strict) {
      new Set([...stripKeys, ...keys]).forEach(key => delete obj[key]);
    }

    return obj;
  }

  return toJSON;
}


// type AutoPath<O, P extends string> = P extends any ?
//   (
//     (P & `${string}.` extends never ? P : P & `${string}.`) extends infer Q ?
//     (Q extends `${infer A}.${infer B}` ?
//       (A extends StringKeys<O> ? `${A}.${AutoPath<Defined<GetStringKey<O, A>>, B>}` : never)
//       :
//       (Q extends StringKeys<O> ?
//         (
//           (Defined<GetStringKey<O, Q>> extends unknown ? Exclude<P, `${string}.`> : never)
//           |
//           (StringKeys<Defined<GetStringKey<O, Q>>> extends never ? never : `${Q}.`)
//         )
//         :
//         StringKeys<O>
//       )
//     )
//     :
//     never
//   )
//   :
//   never;


// type GetStringKey<T, K extends StringKeys<T>> = K extends keyof T ? ExtractType<T[K]> : never;

// type Defined<T> = Exclude<T, null | undefined>;

// type StringKeys<T> = T extends Collection<any, any> ?
//   (`${Exclude<keyof ExtractType<T>, symbol>}`)
//   :
//   (
//     T extends Reference<any> ?
//     (`${Exclude<keyof ExtractType<T>, symbol>}`)
//     :
//     (
//       T extends object ? `${Exclude<keyof ExtractType<T>, symbol>}` : never
//     )
//   );

// type Loadable<T> = Collection<T, any> | Reference<T> | readonly T[];
// type ExtractType<T> = T extends Loadable<infer U> ? U : T;