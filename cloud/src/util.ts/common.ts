
// 从对象中抓取部分属性生成另一个对象
export function pick<O extends Object, P extends string>(obj: O, props: AutoPath<O, P>[], target?: O): O {
  const newObj = target || {} as O;

  Object.keys(obj).forEach(function (key) {
    if (props.includes('**' as any) || props.includes(key as any)) {
      if (obj[key] !== null && obj[key] !== undefined) {
        newObj[key] = obj[key];
      }
    }
    if (props.includes(('-' + key) as any)) {
      delete newObj[key];
    }
  });

  return newObj;
}

export function isDevMode() {
  return process.env.NODE_ENV !== 'production'
}


// 校验字符串代表的属性是否在类型下存在
type AutoPath<O, P extends string> = (P extends `${infer A}.${infer B}` ?
  (A extends StringKeys<O> ? `${A}.${AutoPath<GetStringKey<O, A>, B>}` : never)
  :
  (P extends StringKeys<O> ?
    (StringKeys<GetStringKey<O, P>> extends never ? never : `${P}.`)
    :
    StringKeys<O>
  )
);

type GetStringKey<T, K> = K extends keyof T ? T[K] : never;

type StringKeys<T> = Exclude<keyof T, symbol> | '**' | WrapMinus<Exclude<keyof T, symbol>>;

type WrapMinus<T> = T extends string ? `-${T}` : never;

