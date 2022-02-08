import { Button } from 'antd';
import { useEffect } from 'react';
import { useRef, useState } from 'react';
import Editor from './components/Editor';
import Studio from './components/Studio';
import styles from './index.module.less';

function Home() {
  const [pageUrl] = useState('http://localhost:8888/admin/groot/page1');
  const [pageName] = useState('groot::{"path": "/groot/page1","name":"demo"}');
  const iframeRef = useRef({} as any);
  const iframeReadyRef = useRef({} as any);
  const codeMetadataRef = useRef('[{ "key": "children", "defaultValue": "hello world!" }]');
  const [mode, setMode] = useState<'studio' | 'editor'>('studio');

  const refresh = (content: string) => {
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
        props: JSON.parse(content),
      }
    }, '*');
  }

  useEffect(() => {
    window.self.addEventListener('message', (event: any) => {
      if (event.data === 'ok') {
        iframeReadyRef.current = true;
        setTimeout(() => {
          refresh(codeMetadataRef.current);
        })
      }
    });
  }, []);

  return <div className={styles.main}>
    <iframe ref={iframeRef} name={pageName} className={styles.page} src={pageUrl}></iframe>
    <div className={styles.setting}>
      <div className={styles.sideEdge}></div>
      <div>
        <Button type="primary" onClick={() => setMode(mode === 'studio' ? 'editor' : 'studio')}>切换</Button>
      </div>
      {mode === 'studio' ? <Studio /> : <Editor onContentChange={refresh} defaultContent={codeMetadataRef.current} />}
    </div>
  </div>
}

export default Home;