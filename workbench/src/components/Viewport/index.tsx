import { useEffect, useRef } from "react";

import ViewportDrag from "@components/Viewport/ViewportDrag";
import ViewportOutlineMarker from "@components/Viewport/ViewportOutlineMarker";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";

import styles from './index.module.less';

const viewportMode = {
  h5: {
    width: '400px',
    height: '700px'
  },
  pc: {
    width: '100%',
    height: '100%'
  }
}

const Viewport: React.FC = () => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const iframeRef = useRef<HTMLIFrameElement>({} as any);

  useEffect(() => {
    workbenchModel.initIframe(iframeRef.current);
  }, []);

  const viewportStyles = viewportMode[workbenchModel.viewportMode];

  return <div className={styles.container}>
    <div className={styles.viewport} style={viewportStyles}>
      <iframe ref={iframeRef} ></iframe>
      {!workbenchModel.prototypeMode ? <ViewportOutlineMarker /> : null}
      {!workbenchModel.prototypeMode ? <ViewportDrag /> : null}
    </div>
    {/* 防止拖拽缩放过程中由于鼠标移入iframe中丢失鼠标移动事件 */}
    <div id={workbenchModel.viewportMaskId} />
  </div>
}

export default Viewport;