import { useEffect, useRef, useState } from 'react';
import { useModel } from '@grootio/common';


import { isPrototypeMode } from 'context';
import ViewportDrag from './ViewportDrag';
import ViewportOutlineMarker from './ViewportOutlineMarker';
import WorkAreaModel from '../WorkAreaModel';

import styles from './index.module.less';

const viewportModeMap = {
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
  const iframeRef = useRef<HTMLIFrameElement>({} as any);
  const workAreaModel = useModel(WorkAreaModel)
  const [viewportMode, setViewportMode] = useState('pc');

  useEffect(() => {
    workAreaModel.initIframe(iframeRef.current);
  }, []);

  const viewportStyles = viewportModeMap[viewportMode];

  return <div className={styles.container} style={viewportStyles}>
    <iframe ref={iframeRef} ></iframe>
    {!isPrototypeMode() && (
      <>
        <ViewportOutlineMarker />
        <ViewportDrag />
      </>
    )}
  </div>
}

export default Viewport;