import { useEffect, useRef } from 'react';

import SidePanel from '@components/SidePanel';
import WidgetWindow from '@components/WidgetWindow';
import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import styles from './index.module.less';
import IframeDragMask from '@components/IframeDragMask';
import IframeMarker from '@components/IframeMarker';

type PropsType = {
}

const Workbench: React.FC<PropsType> = () => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const iframeRef = useRef<HTMLIFrameElement>({} as any);

  useEffect(() => {
    if (workbenchModel.prototypeMode && workbenchModel.org) {
      workbenchModel.initIframe(iframeRef.current);
    } else if (!workbenchModel.prototypeMode && workbenchModel.application) {
      workbenchModel.initIframe(iframeRef.current);
    }
  }, [workbenchModel.application, workbenchModel.org])

  return (<div className={`${styles.container} ${workbenchModel.prototypeMode ? styles.prototypeMode : ''}`} >

    <div className={styles.preview}>
      {/* 防止拖拽缩放过程中由于鼠标移入iframe中丢失鼠标移动事件 */}
      <iframe ref={iframeRef}></iframe>
      <IframeDragMask />
      {!workbenchModel.prototypeMode ? <IframeMarker /> : null}
    </div>

    <WidgetWindow />

    <SidePanel className={styles.sidePanel} />
  </div>)
}

export default Workbench;