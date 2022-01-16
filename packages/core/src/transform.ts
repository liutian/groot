import { emitCode } from './builder';
import { CodeMetadata } from './codeMetadata';
import defaultConfig from './defaultConfig';

const sourceMapPrefix = '//# sourceMappingURL=data:application/json;base64,';
const tsSourceMapPatchReg = new RegExp(sourceMapPrefix + '.+$');

export function transform(
  metadata: CodeMetadata,
  options: optionsType
): string {
  const sourceCode = emitCode(metadata);
  const result = options.transpileModule(sourceCode, {
    compilerOptions: Object.assign({}, defaultConfig, options.tsConfig),
    reportDiagnostics: false,
    moduleName: metadata.moduleName,
    fileName: metadata.moduleName + '.tsx',
  });

  // fix 修复typescript sourcemap 总是缺少两行
  const codeText = result.outputText.replace(
    tsSourceMapPatchReg,
    (matchStr) => {
      const mapStr = matchStr.substr(sourceMapPrefix.length);
      const mapObjStr = self.atob(mapStr);
      const mapObj = JSON.parse(mapObjStr);
      mapObj.mappings = ';;' + mapObj.mappings;

      return sourceMapPrefix + self.btoa(JSON.stringify(mapObj));
    }
  );

  return codeText;
}

type optionsType = { tsConfig?: any; transpileModule: transpileModuleType };

type transpileModuleType = (
  input: string,
  transpileOptions: any
) => transpileOutputType;

type transpileOutputType = {
  outputText: string;
  diagnostics?: any[];
  sourceMapText?: string;
};
