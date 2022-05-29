import { HTMLAttributes, useRef } from "react";

import { useModel } from "@util/robot";
import StudioModel from '@model/Studio';

import styles from './index.module.less';
import SideHeader from "../SideHeader";
import SideToolBar from "../SideToolBar";
import SideFooter from "../SideFooter";
import Studio from "../Studio";
import MouseFollow from "components/MouseFollow"
import WorkbenchModel from '@model/Workbench';;

const SidePanel: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  // 使用页面全局实例
  const [model] = useModel<StudioModel>('studio');

  const [workbenchModel, updateAction] = useModel<WorkbenchModel>('workbench');

  const containerRef = useRef<HTMLDivElement>(null);

  return <div {...props} ref={containerRef}>

    <SideHeader className={styles.headerContainer} />

    <SideToolBar className={styles.navContainer} />

    <div className={styles.content}>
      {model.manualMode ? <Studio /> : null}
    </div>

    <SideFooter className={styles.footerContainer} />

    <MouseFollow
      cursor="col-resize"
      className={styles.moveHandle}
      start={() => {
        return containerRef.current!.getBoundingClientRect().width;
      }}
      move={(x, _y, originData) => {
        const width = originData - x;
        if (width < 480 || width > 800) {
          return;
        }

        updateAction(() => {
          workbenchModel.sideWidth = width;
        })
      }}
    />
  </div>
}

export default SidePanel;