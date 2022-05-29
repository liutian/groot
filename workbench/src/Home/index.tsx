import { useEffect, useRef, useState } from 'react';

import { registerModel, useModel } from '@util/robot';
import StudioModel from '@model/Studio';
import { serverPath } from 'config';

import styles from './index.module.less';
import SidePanel from './components/SidePanel';
import WidgetWindow from './components/WidgetWindow';

const Home = () => {
  // 注册工作台页面全局数据实例，每次页面打开重新初始化
  useState(() => registerModel('studio', new StudioModel()));
  // 提供给iframe页面mock数据（正常情况需要iframe页面通过接口获取元数据信息）
  const [pageName, setPageName] = useState('');
  const iframeRef = useRef({} as any);
  // 页面组件配置器
  const PageDataRef = useRef<Page>();
  // 使用页面全局实例
  const [model, updateAction] = useModel<StudioModel>('studio', true);


  useEffect(() => {
    // 加载页面组件配置器数据
    fetch(`${serverPath}/page/1`).then(r => r.json()).then(({ data: pageData }: { data: Page }) => {
      PageDataRef.current = pageData;
      model.init(pageData.component.studio);
      // todo
      setPageName(`groot::{"path": "${pageData.path}","name":"${pageData.name}"}`);
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
  const notifyIframe = (content?: string) => {
    const props = content || PageDataRef.current?.component.codeMetaData;

    iframeRef.current.contentWindow.postMessage({
      type: 'refresh',
      path: PageDataRef.current?.path,
      metadata: {
        moduleName: PageDataRef.current?.component.studio.moduleName,
        packageName: PageDataRef.current?.component.studio.packageName,
        componentName: PageDataRef.current?.component.studio.componentName,
        // todo
        props
      }
    }, '*');
  }

  updateAction(() => {
    model.notifyIframe = notifyIframe;
  }, false);

  return <div className={styles.container}>
    <div className={styles.mainView}>
      {PageDataRef.current ? <iframe ref={iframeRef} name={pageName} src={PageDataRef.current.url}></iframe> : null}
    </div>

    <WidgetWindow className={styles.widgetWindow} />

    <SidePanel className={styles.sidePanel} />
  </div >
}

export default Home;