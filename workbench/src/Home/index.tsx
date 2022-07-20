import { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { useRegisterModel } from '@util/robot';
import StudioModel from '@model/StudioModel';
import { serverPath } from 'config';

import styles from './index.module.less';
import SidePanel from './components/SidePanel';
import WidgetWindow from './components/WidgetWindow';
import WorkbenchModel from '@model/WorkbenchModel';
import { launchIframeManager } from './iframeManager';

const Home: React.FC<{ prototypeMode?: boolean }> = ({ prototypeMode }) => {
  const [studioModel] = useRegisterModel<StudioModel>('studio', new StudioModel());
  const [workbenchModel, updateWorkbennchModel] = useRegisterModel<WorkbenchModel>('workbench', new WorkbenchModel());

  const iframeRef = useRef<HTMLIFrameElement>({} as any);

  let { componentId } = useParams();
  let [searchParams] = useSearchParams();

  useEffect(() => {
    const applicationId = searchParams.get('applicationId');
    let applicationUrl = `${serverPath}/application/detail`;
    let componentUrl = `${serverPath}/component`;

    if (!applicationId) {
      throw new Error('not found applicationId');
    }

    // 确定请求地址
    if (prototypeMode) {
      componentUrl = `${componentUrl}/prototype?id=${componentId}&versionId=${searchParams.get('versionId') || ''}`;
    } else {
      componentUrl = `${componentUrl}/instance?id=${componentId}&releaseId=${searchParams.get('releaseId') || ''}`;
    }

    // todo ....
    // 获取组件信息
    fetch(componentUrl).then(res => res.json()).then(({ data: component }: { data: Component }) => {
      if (prototypeMode) {
        applicationUrl = `${applicationUrl}/${applicationId}`;
      } else {
        applicationUrl = `${applicationUrl}/${component.application.id}`
      }

      fetch(applicationUrl).then(res => res.json()).then(({ data: application }: { data: Application }) => {
        component.application = application;
        workbenchModel.init(component, prototypeMode);
        studioModel.init(workbenchModel);

        setTimeout(() => {
          if (workbenchModel.destory) {
            return;
          }

          updateWorkbennchModel(() => {
            // 必须在workbenchModel方法之外执行launchIframeManager,否则message会被zonejs拦截触发重复刷新
            workbenchModel.iframeManager = launchIframeManager(iframeRef.current, workbenchModel);
          }, false);
          if (prototypeMode || !workbenchModel.component.page) {
            workbenchModel.iframeManager.navigation(workbenchModel.component.application.playgroundPath);
          } else {
            // this.iframeManager.setIframePath()
          }
        }, 0);
      })
    }, () => {
      workbenchModel.loadComponent = 'notfound';
    });

    return () => {
      workbenchModel.destoryModel();
    }
  }, []);

  if (workbenchModel.loadComponent === 'doing') {
    return <>loading</>
  } else if (workbenchModel.loadComponent === 'notfound') {
    return <>notfound component</>
  } else {
    return (<div className={styles.container} >
      <div className={styles.preview}>
        <iframe ref={iframeRef} ></iframe>
        {/* 防止拖拽缩放过程中由于鼠标移入iframe中丢失鼠标移动事件 */}
        <div className="drag-mask"></div>
      </div>

      <WidgetWindow />

      <SidePanel className={styles.sidePanel} />
    </div>);
  }

}

export default Home;