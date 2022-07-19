import { useEffect, useRef } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';

import { useRegisterModel } from '@util/robot';
import StudioModel from '@model/StudioModel';
import { serverPath } from 'config';

import styles from './index.module.less';
import SidePanel from './components/SidePanel';
import WidgetWindow from './components/WidgetWindow';
import WorkbenchModel from '@model/WorkbenchModel';
import { destroyIframe, startManageIframe } from './iframeManager';

const Home: React.FC<{ prototypeMode?: boolean }> = ({ prototypeMode }) => {
  const [studioModel] = useRegisterModel<StudioModel>('studio', new StudioModel());
  const [workbenchModel, workbenchUpdateAction] = useRegisterModel<WorkbenchModel>('workbench', new WorkbenchModel());

  const iframeRef = useRef<HTMLIFrameElement>({} as any);

  let { componentId } = useParams();
  let [searchParams] = useSearchParams();

  useEffect(() => {
    let url = `${serverPath}/component`;

    // 确定请求地址
    if (prototypeMode) {
      url = `${url}/prototype?id=${componentId}&versionId=${searchParams.get('versionId') || ''}`;
    } else {
      url = `${url}/instance?id=${componentId}&releaseId=${searchParams.get('releaseId') || ''}`;
    }

    // 获取组件信息
    fetch(url).then(r => r.json()).then(({ data }: { data: Component }) => {
      workbenchModel.init(data, iframeRef, prototypeMode);
      studioModel.init(workbenchModel);
      setTimeout(() => {
        startManageIframe(iframeRef.current, workbenchModel);
      }, 0);
    }, () => {
      workbenchModel.loadComponent = 'notfound';
    });

    return () => {
      destroyIframe();
    }
  }, []);

  if (workbenchModel.loadComponent === 'doing') {
    return <>loading</>
  } else if (workbenchModel.loadComponent === 'notfound') {
    return <>notfound component</>
  } else {
    return (<div className={styles.container} >
      <div className={styles.preview}>
        <iframe ref={iframeRef} src={workbenchModel.iframePath}></iframe>
        {/* 防止拖拽缩放过程中由于鼠标移入iframe中丢失鼠标移动事件 */}
        <div className="drag-mask"></div>
      </div>

      <WidgetWindow />

      <SidePanel className={styles.sidePanel} />
    </div>);
  }

}

export default Home;