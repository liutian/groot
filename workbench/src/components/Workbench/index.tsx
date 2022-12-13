
import PropSetter from '@components/PropSetter';
import WidgetWindow from '@components/WidgetWindow';
import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import SideBar from '@components/SideBar';
import WorkArea from '@components/WorkArea';
import FooterBar from '@components/FooterBar';
import TopBar from '@components/TopBar';

import styles from './index.module.less';

const Workbench: React.FC = () => {
  const [workbenchModel] = useModel(WorkbenchModel);

  return (<div id={workbenchModel.containerId} className={`${styles.container} ${workbenchModel.prototypeMode ? styles.prototypeMode : ''}`} >

    <div className={styles.sideBar}>
      <SideBar />
    </div>

    <div className={styles.topBar}>
      <TopBar />
    </div>

    <div className={styles.workarea}>
      <WorkArea />
    </div>

    <div className={styles.footerBar}>
      <FooterBar />
    </div>

    <WidgetWindow />

    <div className={styles.propSetter}>
      <PropSetter />
    </div >
  </div>)
}

export default Workbench;