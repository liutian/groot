import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import { useEffect, useRef } from 'react';
import ViewportDrag from './ViewportDrag';
import ViewportOutlineMarker from './ViewportOutlineMarker';
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

  return <div className={styles.container} style={viewportStyles}>
    <iframe ref={iframeRef} ></iframe>
    {!workbenchModel.prototypeMode ? <ViewportOutlineMarker /> : null}
    {!workbenchModel.prototypeMode ? <ViewportDrag /> : null}
  </div>
}

export default Viewport;