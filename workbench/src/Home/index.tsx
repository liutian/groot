import { useEffect, useRef, useState } from 'react';

import { registerModel, useModel } from '@util/robot';
import StudioModel from '@model/StudioModel';
import { serverPath } from 'config';

import styles from './index.module.less';
import SidePanel from './components/SidePanel';
import WidgetWindow from './components/WidgetWindow';
import WorkbenchModel from '@model/WorkbenchModel';
import { useParams } from 'react-router-dom';

const Home = () => {
  // 注册工作台页面全局数据实例，每次页面打开重新初始化
  useState(() => registerModel('studio', new StudioModel()));
  useState(() => registerModel('workbench', new WorkbenchModel()));
  // 提供给iframe页面mock数据（正常情况需要iframe页面通过接口获取元数据信息）
  const [pageName, setPageName] = useState('');
  const iframeRef = useRef({} as any);
  // 使用页面全局实例
  const [studioModel, updateAction] = useModel<StudioModel>('studio', true);
  const [workbenchModel, workbenchUpdateAction] = useModel<WorkbenchModel>('workbench', true);
  let { id: componentId, releaseId, versionId } = useParams();


  useEffect(() => {
    // // 加载页面组件配置器数据
    // fetch(`${serverPath}/page/1`).then(r => r.json()).then(({ data: pageData }: { data: Page }) => {
    //   PageDataRef.current = pageData;
    //   studioModel.init(pageData.component.studio);
    //   // todo
    //   setPageName(`groot::{"path": "${pageData.path}","name":"${pageData.name}"}`);
    // });


    fetch(`${serverPath}/component?componentId=${componentId}&releaseId=${releaseId}&versionId=${versionId}`).then(r => r.json()).then((data: Component) => {
      workbenchUpdateAction(() => {
        workbenchModel.loadComponent = 'over';
        studioModel.init(data);
      })
    })

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
    const props = content;

    iframeRef.current.contentWindow.postMessage({
      type: 'refresh',
      path: studioModel.component.instance!.path,
      metadata: {
        moduleName: studioModel.component.moduleName,
        packageName: studioModel.component.packageName,
        componentName: studioModel.component.componentName,
        // todo
        props
      }
    }, '*');
  }

  updateAction(() => {
    studioModel.notifyIframe = notifyIframe;
  }, false);

  const renderLoadProject = () => {
    if (workbenchModel.loadComponent === 'doing') {
      return <>loading</>
    } else {
      return <>notfound</>
    }
  }

  return workbenchModel.loadComponent === 'over' ? (<div className={styles.container} style={{ '--side-width': `${workbenchModel.sideWidth}px` } as any}>
    <div className={styles.mainView}>
      {workbenchModel.loadComponent === 'over' ? <iframe ref={iframeRef} name={pageName} src={studioModel.component.instance!.path}></iframe> : null}
    </div>

    <WidgetWindow />

    <SidePanel className={styles.sidePanel} />
  </div>) : renderLoadProject();
}

export default Home;