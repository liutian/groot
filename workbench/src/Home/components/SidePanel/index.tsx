import { HTMLAttributes } from "react";

import { useModel } from "@util/robot";
import StudioModel from '@model/Studio';

import styles from './index.module.less';
import SideHeader from "../SideHeader";
import SideToolBar from "../SideToolBar";
import SideFooter from "../SideFooter";
import Studio from "../Studio";

const SidePanel: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {

  // 使用页面全局实例
  const [model] = useModel<StudioModel>('studio', true);

  return <div {...props}>

    <SideHeader className={styles.headerContainer} />

    <SideToolBar className={styles.navContainer} />

    <div className={styles.content}>
      {model.manualMode ? <Studio /> : null}
    </div>

    <SideFooter className={styles.footerContainer} />
  </div>
}

export default SidePanel;