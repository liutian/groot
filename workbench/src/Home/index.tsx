import { useEffect } from 'react';
import { useRef, useState } from 'react';
import styles from './index.module.less';

function Home() {
  const [pageUrl] = useState('http://localhost:8888/admin/groot/page1');
  const [pageName] = useState('groot::{"path": "/groot/page1","name":"demo"}');
  const iframeRef = useRef({} as any);
  const [pageData, setPageData] = useState('[{ "key": "children", "defaultValue": "hello world!" }]');
  const [iframeReady, setIframeReady] = useState(false);

  const refresh = () => {
    iframeRef.current.contentWindow.postMessage({
      type: 'refresh',
      path: '/groot/page1',
      metadata: {
        moduleName: 'Button_text',
        packageName: 'antd',
        componentName: 'Button',
        props: JSON.parse(pageData),
      }
    }, '*');
  }

  useEffect(() => {
    window.self.addEventListener('message', (event: any) => {
      if (event.data === 'ok') {
        setIframeReady(true);
        setTimeout(() => {
          refresh();
        })
      }
    });
  }, []);

  return <div className={styles.main}>
    <iframe ref={iframeRef} name={pageName} className={styles.page} src={pageUrl}></iframe>
    <div className={styles.setting}>
      <div className={styles.sideEdge}></div>
      <textarea onChange={(e) => setPageData(e.target.value)} value={pageData}></textarea>
      <input type="submit" disabled={!iframeReady} value="提交" onClick={() => refresh()} />
    </div>
  </div>
}

export default Home;