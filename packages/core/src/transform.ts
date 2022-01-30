import { emitCode } from './codeFactory';
import { CodeMetadata } from './CodeMetadata';
import defaultConfig from './defaultOption';

const sourceMapPrefix = '//# sourceMappingURL=data:application/json;base64,';
const tsSourceMapPatchReg = new RegExp(sourceMapPrefix + '.+$');

/**
 * 
 * @param metadata 代码元数据
 * @param options 配置项
 * @returns 转译后可以运行代码
 */
export function transform(
  metadata: CodeMetadata,
  translator: TranslatorType,
  translatorOptions?: any
): string {
  // 根据代码元数据生成源码
  const sourceCode = emitCode(metadata);
  // 将源码转译为最终可以在浏览器中运行的代码
  const outputResult = translator(sourceCode, {
    compilerOptions: Object.assign({}, defaultConfig, translatorOptions),
    reportDiagnostics: false,
    moduleName: metadata.moduleName,
    fileName: metadata.moduleName + '.tsx',
  });

  // fix 修复typescript sourcemap 总是缺少两行
  const outputText = outputResult.outputText.replace(
    tsSourceMapPatchReg,
    (matchStr) => {
      const encryptStr = matchStr.substring(sourceMapPrefix.length);
      const encryptText = self.atob(encryptStr);
      const encryptObj = JSON.parse(encryptText);
      // 修复...
      encryptObj.mappings = ';;' + encryptObj.mappings;

      return sourceMapPrefix + self.btoa(JSON.stringify(encryptObj));
    }
  );

  return outputText;
}


export type TranslatorType = (
  input: string,
  options: any
) => TranslatorOutputType;

export type TranslatorOutputType = {
  outputText: string;
  diagnostics?: any[];
  sourceMapText?: string;
};
