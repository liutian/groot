import { useEffect } from 'react';
import { useRef, useState } from 'react';
import styles from './index.module.less';
import * as monaco from 'monaco-editor';
import { metadataSchema } from '@groot-elf/core';


function Home() {
  const [pageUrl] = useState('http://localhost:8888/admin/groot/page1');
  const [pageName] = useState('groot::{"path": "/groot/page1","name":"demo"}');
  const iframeRef = useRef({} as any);
  const iframeReadyRef = useRef({} as any);
  const codeEditorContainerRef = useRef({} as any);
  const editorRef = useRef({} as any);
  const editorSubscriptionRef = useRef({} as any);

  const refresh = () => {
    if (!iframeReadyRef.current) {
      return;
    }

    iframeRef.current.contentWindow.postMessage({
      type: 'refresh',
      path: '/groot/page1',
      metadata: {
        moduleName: 'Button_text',
        packageName: 'antd',
        componentName: 'Button',
        props: JSON.parse(editorRef.current.getValue()),
      }
    }, '*');
  }

  useEffect(() => {
    window.self.addEventListener('message', (event: any) => {
      if (event.data === 'ok') {
        iframeReadyRef.current = true;
        setTimeout(() => {
          refresh();
        })
      }
    });
  }, []);

  useEffect(() => {

    const jsonCode = '[{ "key": "children", "defaultValue": "hello world!" }]';
    let modelUri = monaco.Uri.parse('groot://index.json');
    let model = monaco.editor.createModel(jsonCode, 'json', modelUri);

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
      }
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        const model = editorRef.current.getModel();
        if (model) {
          model.dispose();
        }
        if (editorSubscriptionRef.current) {
          editorSubscriptionRef.current.dispose();
        }
      }
    }
  }, []);

  useEffect(() => {
    const action = editorRef.current.getAction('editor.action.formatDocument');

    setTimeout(() => {
      action.run();
    }, 100);
  }, []);

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
        refresh();
      }
    });
  }, []);

  return <div className={styles.main}>
    <iframe ref={iframeRef} name={pageName} className={styles.page} src={pageUrl}></iframe>
    <div className={styles.setting}>
      <div className={styles.sideEdge}></div>
      <div className="code-editor" style={{ width: '100%', height: '300px' }} ref={codeEditorContainerRef}></div>
    </div>
  </div>
}

export default Home;