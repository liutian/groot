import { emitStatNameForProp } from './util';
import { CodeMetadata, StatType } from './CodeMetadata';

const codeTemplate = `
import React from 'react';
import { $componentName$ } from '$packageName$';

function $componentName$_Wrap () {
  $stats$

  return <$componentName$ $props$/>
}

export default $componentName$_Wrap;
`;

/**
 * 生成代码
 * @param metadata 代码元数据
 * @returns 源代码（ts）
 */
export function emitCode(metadata: CodeMetadata): string {

  let statArr: StatType[] = [];

  let code = codeTemplate.replaceAll('$componentName$', metadata.componentName);

  code = code.replaceAll('$packageName$', metadata.packageName);

  // 生成组件prop代码
  code = code.replaceAll('$props$', metadata.props?.map((item) => {
    if (item.statRelative) {
      let propLiteral = `${item.key}={${emitStatNameForProp(item.key)}}`;
      //搜集stat
      statArr.push({
        key: item.key,
        defaultValue: item.defaultValue,
        valueType: item.valueType
      });
      return propLiteral;
    } else {
      let propLiteral = '';

      if (item.valueType === undefined || item.valueType === 'string') {
        propLiteral = `${item.key}="${item.defaultValue}"`;
      } else if (item.valueType === 'boolean' || item.valueType === 'number') {
        propLiteral = `${item.key}={${item.defaultValue}}`;
      } else if (item.valueType === 'array' || item.valueType === 'object') {
        /** todo */
      } else if (item.valueType === 'function') {
        /** todo */
      }

      return propLiteral;
    }
  }).join(' ') || '');

  // 生成stat代码
  code = code.replaceAll('$stats$', statArr.map((item) => {
    let statLiteral = `const [${emitStatNameForProp(item.key)}] = useStat($value$)`;
    if (item.valueType === 'string') {
      statLiteral = statLiteral.replaceAll('$value$', `'${item.defaultValue}'`);
    } else if (item.valueType === 'number' || item.valueType === 'boolean') {
      statLiteral = statLiteral.replaceAll('$value$', `${item.defaultValue}`);
    } else if (item.valueType === 'array' || item.valueType === 'object') {
      /** todo */
    } else if (item.valueType === 'function') {
      /** todo */
    }
  }).join(';\n'));

  return code;
}
