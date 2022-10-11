import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';

type propsType = {
  value?: string;
  onChange?: (value: string) => void,
  type?: 'json' | 'function'
}


function TextEditor({ onChange, value, type = 'json' }: propsType) {
  const editorSubscriptionRef = useRef({} as any);
  const editorRef = useRef({} as any);
  const codeEditorContainerRef = useRef({} as any);
  const [[model, modelUri]] = useState(() => {
    return createModel(type);
  })

  useEffect(() => {
    if (type === 'json') {
      model.setValue(JSON.stringify(value || ''));
    } else {
      model.setValue(value || '');
    }

    // http://json-schema.org/learn/getting-started-step-by-step
    // http://json-schema.org/understanding-json-schema/
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'https://groot.dev/metadata-list.schema.json',
          fileMatch: [modelUri.toString()],
        }
      ]
    });

    monaco.languages.typescript.typescriptDefaults.addExtraLib(`
    declare namespace $groot{
      const version: string;
      let tick: number;
    }
    declare let $exportFn: Function;
    declare const $props: any;
    `, '');

    editorRef.current = monaco.editor.create(codeEditorContainerRef.current, {
      model,
      theme: 'vs-dark',
      formatOnPaste: true,
      minimap: {
        enabled: false
      },
    });

    return () => {
      if (!editorRef.current) {
        return
      }

      editorRef.current.dispose();
      const model = editorRef.current.getModel();
      if (model) {
        model.dispose();
      }
      if (editorSubscriptionRef.current) {
        editorSubscriptionRef.current.dispose();
      }
    }
  }, []);

  // 初始化默认你执行一次文档格式化
  useEffect(() => {
    const action = editorRef.current.getAction('editor.action.formatDocument');

    const initRunTimeout = setTimeout(() => {
      action.run();
    }, 100);

    return () => {
      clearTimeout(initRunTimeout);
    }
  }, []);

  // 绑定键盘事件，自动触发更新
  useEffect(() => {
    let keyDown = false;
    editorRef.current.onKeyDown(() => {
      keyDown = true;
      setTimeout(() => {
        keyDown = false;
      });
    })

    editorSubscriptionRef.current = editorRef.current.onDidChangeModelContent(() => {
      if (keyDown) {
        onChange(editorRef.current.getValue());
      }
    });
  }, []);

  return <div style={{ width: '100%', height: '180px' }} ref={codeEditorContainerRef}></div>
}

let ticket = 0;
function createModel(type: 'json' | 'function'): [monaco.editor.ITextModel, monaco.Uri] {
  if (type === 'json') {
    const jsonModelUri = monaco.Uri.parse(`groot://j-${++ticket}.json`);
    const jsonModel = monaco.editor.createModel('', 'json', jsonModelUri);
    return [jsonModel, jsonModelUri];
  } else {
    const functionModelUri = monaco.Uri.parse(`groot://f-${++ticket}.json`);
    const functionModel = monaco.editor.createModel('', 'typescript', functionModelUri);
    return [functionModel, functionModelUri];
  }
}
export default TextEditor;