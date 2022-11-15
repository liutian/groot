
import SidePanel from '@components/SidePanel';
import WidgetWindow from '@components/WidgetWindow';
import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import styles from './index.module.less';
import SideBar from '@components/SideBar';
import Viewport from '@components/Viewport';
import FixedWidgetWindow from '@components/FixedWidgetWindow';
import TopBar from '@components/TopBar';


const Workbench: React.FC = () => {
  const [workbenchModel] = useModel(WorkbenchModel);

  return (<div id={workbenchModel.containerId} className={`${styles.container} ${workbenchModel.prototypeMode ? styles.prototypeMode : ''}`} >

    <div className={styles.sideBar}>
      <SideBar />
    </div>

    <div className={styles.topBar}>
      <TopBar />
    </div>

    <div className={styles.viewport}>
      <Viewport />
    </div>

    <div className={styles.footerWidgetWindow}>
      <FixedWidgetWindow />
    </div>

    <WidgetWindow />

    <div className={styles.sidePanel}>
      <SidePanel />
    </div >
  </div>)
}

export default Workbench;