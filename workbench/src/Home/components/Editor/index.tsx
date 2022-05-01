import * as monaco from 'monaco-editor';
import { metadataSchema } from '@grootio/core';
import { useEffect, useRef } from 'react';

type propsType = {
  defaultContent: any;
  onContentChange: (content: string) => void
}

let modelUri = monaco.Uri.parse('groot://index.json');
let model = monaco.editor.createModel('', 'json', modelUri);

function Editor({ onContentChange, defaultContent }: propsType) {
  const editorSubscriptionRef = useRef({} as any);
  const editorRef = useRef({} as any);
  const codeEditorContainerRef = useRef({} as any);


  useEffect(() => {
    model.setValue(JSON.stringify(defaultContent || ''));

    // http://json-schema.org/learn/getting-started-step-by-step
    // http://json-schema.org/understanding-json-schema/
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'https://groot.dev/metadata-list.schema.json',
          fileMatch: [modelUri.toString()],
          schema: {
            type: 'array',
            items: metadataSchema
          }
        }
      ]
    });

    editorRef.current = monaco.editor.create(codeEditorContainerRef.current, {
      model,
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
        onContentChange(editorRef.current.getValue());
      }
    });
  }, []);

  return <div style={{ width: '100%', height: '300px' }} ref={codeEditorContainerRef}></div>
}

export default Editor;