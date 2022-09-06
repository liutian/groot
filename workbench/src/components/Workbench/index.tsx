import { useEffect, useRef } from 'react';

import SidePanel from '@components/SidePanel';
import WidgetWindow from '@components/WidgetWindow';
import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import styles from './index.module.less';

type PropsType = {
}

const Workbench: React.FC<PropsType> = () => {
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
  const iframeRef = useRef<HTMLIFrameElement>({} as any);

  useEffect(() => {
    setTimeout(() => {
      workbenchModel.initIframe(iframeRef.current);
    }, 0);

    return () => {
      workbenchModel.destroyModel();
    }
  }, [])

  return (<div className={`${styles.container} ${workbenchModel.prototypeMode ? styles.prototypeMode : ''}`} >

    <div className={styles.preview}>
      {/* 防止拖拽缩放过程中由于鼠标移入iframe中丢失鼠标移动事件 */}
      <div id={workbenchModel.iframeDragMaskId}></div>
      <iframe ref={iframeRef}></iframe>
    </div>

    <WidgetWindow />

    <SidePanel className={styles.sidePanel} />
  </div>)
}

export default Workbench;