import IframeDrag from "@components/IframeDrag";
import IframeOutlineMarker from "@components/IframeOutlineMarker";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { useEffect, useRef } from "react";

import styles from './index.module.less';

const viewportMode = {
  h5: {
    width: '400px',
    height: '700px'
  },
  pc: {
  }
}

const Viewport: React.FC = () => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const iframeRef = useRef<HTMLIFrameElement>({} as any);

  useEffect(() => {
    workbenchModel.initIframe(iframeRef.current);
  }, []);

  const iframeStyles = viewportMode[workbenchModel.viewportMode];

  return <div className={styles.container}>
    {/* 防止拖拽缩放过程中由于鼠标移入iframe中丢失鼠标移动事件 */}
    <iframe ref={iframeRef} style={iframeStyles} ></iframe>
    <div id={workbenchModel.viewportMaskId} />
    {!workbenchModel.prototypeMode ? <IframeDrag /> : null}
    {!workbenchModel.prototypeMode ? <IframeOutlineMarker /> : null}
  </div>
}

export default Viewport;