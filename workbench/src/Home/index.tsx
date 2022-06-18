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
  // 注册工作台页面全局数据实例，每次页面打开重新初始化
  const [studioModel] = useRegisterModel<StudioModel>('studio', new StudioModel());
  const [workbenchModel, workbenchUpdateAction] = useRegisterModel<WorkbenchModel>('workbench', new WorkbenchModel());

  // 提供给iframe页面mock数据（正常情况需要iframe页面通过接口获取元数据信息）
  const [pageName, setPageName] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>({} as any);
  let { componentId } = useParams();
  let [searchParams] = useSearchParams();

  useEffect(() => {

    let url = `${serverPath}/component`;
    if (studioModel.editMode) {
      url = `${url}/edit?id=${componentId}`;
    } else {
      url = `${url}?id=${componentId}`;
    }

    if (searchParams.get('releaseId')) {
      url += `&releaseId=${searchParams.get('releaseId')}`;
    } else if (searchParams.get('versionId')) {
      url += `&versionId=${searchParams.get('versionId')}`;
    }

    fetch(url).then(r => r.json()).then(({ data }: { data: Component }) => {
      workbenchUpdateAction(() => {
        workbenchModel.loadComponent = 'over';
        studioModel.init(data, iframeRef, !!searchParams.get('editMode'));

        setPageName(`groot::{"path": "${studioModel.component.instance!.path}","name":"${studioModel.component.name}"}`);
      })
    })

    // 监听iframe页面，进行通信
    window.self.addEventListener('message', (event: any) => {
      // iframe页面准备就绪可以接受外部更新
      if (event.data === 'ok') {
        // 首次通知更新数据
        // todo
        studioModel.notifyIframe('todo');
      }
    });
  }, []);

  if (workbenchModel.loadComponent === 'doing') {
    return <>loading</>
  } else if (workbenchModel.loadComponent === 'notfound') {
    return <>notfound component</>
  } else {
    return (<div className={styles.container} >
      <div className={styles.mainView}>
        <iframe ref={iframeRef} name={pageName} src={studioModel.component.instance?.path}></iframe>
        <div className="drag-mask"></div>
      </div>

      <WidgetWindow />

      <SidePanel className={styles.sidePanel} />
    </div>);
  }

}

export default Home;