import { useEffect } from 'react';
import { useRef, useState } from 'react';
import Editor from './components/Editor';
import Studio from './components/Studio';
import styles from './index.module.less';

import { registerModel, useModel } from '@util/robot';
import StudioModel from '@model/Studio';
import { fetchPageComponentData } from '@util/dataSource';


const Home = () => {
  // 注册工作台页面全局数据实例，每次页面打开重新初始化
  useState(() => registerModel('studio', new StudioModel()));
  // 提供给iframe页面mock数据（正常情况需要iframe页面通过接口获取元数据信息）
  const [pageName, setPageName] = useState('');
  const iframeRef = useRef({} as any);
  // 页面组件配置器
  const pageComponentStudioRef = useRef<PageComponentStudio>();
  // 使用页面全局实例
  const [model, updateAction] = useModel<StudioModel>('studio', true);


  useEffect(() => {
    // 加载页面组件配置器数据
    fetchPageComponentData().then((data) => {
      pageComponentStudioRef.current = data;
      model.init(data.codeMetaStudio);
      // todo
      setPageName(`groot::{"path": "${data.path}","name":"${data.name}"}`);
    });

    // 监听iframe页面，进行通信
    window.self.addEventListener('message', (event: any) => {
      // iframe页面准备就绪可以接受外部更新
      if (event.data === 'ok') {
        // 首次通知更新数据
        notifyIframe();
      }
    });
  }, []);

  // 通知iframe更新数据
  const notifyIframe = (codeMetadata?: string) => {
    const propsStr = codeMetadata || pageComponentStudioRef.current?.codeMetadata || '';

    iframeRef.current.contentWindow.postMessage({
      type: 'refresh',
      path: pageComponentStudioRef.current?.path,
      metadata: {
        moduleName: pageComponentStudioRef.current?.moduleName,
        packageName: pageComponentStudioRef.current?.packageName,
        componentName: pageComponentStudioRef.current?.componentName,
        // todo
        props: JSON.parse(propsStr),
      }
    }, '*');
  }

  updateAction(() => {
    model.notifyIframe = notifyIframe;
  }, false);

  const renderSetting = () => {
    if (!pageComponentStudioRef.current) {
      return null;
    }

    if (model.manualMode) {
      return <Editor onContentChange={notifyIframe} defaultContent={pageComponentStudioRef.current.codeMetadata || ''} />;
    } else {
      return <Studio />;
    }
  }


  return <div className={styles.main}>
    {pageComponentStudioRef.current ? <iframe ref={iframeRef} name={pageName} className={styles.pageView} src={pageComponentStudioRef.current.url}></iframe> : null}

    <div className={styles.sidePanel}>
      <div className={styles.sideEdge}></div>
      {renderSetting()}
    </div>
  </div>
}

export default Home;