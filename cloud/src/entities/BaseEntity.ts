import { PrimaryKey, Property, wrap } from '@mikro-orm/core';
export abstract class BaseEntity {

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  omitProps(propKeys: string[]) {
    const stripKeysOfObj = new Map();

    for (let i = 0; i < propKeys.length; i++) {
      const stageKeys = propKeys[i].split('.');
      let context: any = this;

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
