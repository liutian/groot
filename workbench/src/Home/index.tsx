import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { useRegisterModel } from '@util/robot';
import StudioModel from '@model/StudioModel';
import { serverPath } from 'config';

import styles from './index.module.less';
import SidePanel from './components/SidePanel';
import WidgetWindow from './components/WidgetWindow';
import WorkbenchModel from '@model/WorkbenchModel';

const Home = () => {
  const [studioModel] = useRegisterModel<StudioModel>('studio', new StudioModel());
  const [workbenchModel, workbenchUpdateAction] = useRegisterModel<WorkbenchModel>('workbench', new WorkbenchModel());

  // 提供给iframe页面mock数据（正常情况需要iframe页面通过接口获取元数据信息）
  const [pageName, setPageName] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>({} as any);
  let { componentId } = useParams();
  let [searchParams] = useSearchParams();

  useEffect(() => {
    let url = `${serverPath}/component`;
    const stageMode = searchParams.has('stage');

    // 确定请求地址
    if (stageMode) {
      url = `${url}/prototype?id=${componentId}&versionId=${searchParams.get('versionId') || ''}`;
    } else {
      url = `${url}/instance?id=${componentId}&releaseId=${searchParams.get('releaseId') || ''}`;
    }

    // 获取组件信息
    fetch(url).then(r => r.json()).then(({ data }: { data: Component }) => {
      workbenchModel.init(data, iframeRef, stageMode);
      studioModel.init(workbenchModel);
      // todo
      // setPageName(`groot::{"path": "${workbenchModel.component.instance.path}","name":"${workbenchModel.component.name}"}`);
    }, () => {
      workbenchUpdateAction(() => {
        workbenchModel.loadComponent = 'notfound';
      });
    })
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // iframe页面准备就绪可以接受外部更新
      if (event.data === 'ok') {
        // 首次通知更新数据
        // todo
        workbenchModel.notifyIframe('todo');
      }
    }

    // 在iframe页面加载完成之后，自动进行首次数据推送
    window.self.addEventListener('message', onMessage);

    return () => {
      window.self.removeEventListener('message', onMessage);
    }
  }, []);

  if (workbenchModel.loadComponent === 'doing') {
    return <>loading</>
  } else if (workbenchModel.loadComponent === 'notfound') {
    return <>notfound component</>
  } else {
    return (<div className={styles.container} >
      <div className={styles.preview}>
        <iframe ref={iframeRef} name={pageName} src={workbenchModel.iframePath}></iframe>
        {/* 防止拖拽缩放过程中由于鼠标移入iframe中丢失鼠标移动事件 */}
        <div className="drag-mask"></div>
      </div>

      <WidgetWindow />

      <SidePanel className={styles.sidePanel} />
    </div>);
  }

}

export default Home;