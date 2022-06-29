import { HTMLAttributes, useRef } from "react";

import { useModel } from "@util/robot";
import StudioModel from '@model/StudioModel';
import WorkbenchModel from "@model/WorkbenchModel";
import MouseFollow from "components/MouseFollow";

import styles from './index.module.less';
import SideHeader from "../SideHeader";
import SideToolBar from "../SideToolBar";
import SideFooter from "../SideFooter";
import Studio from "../Studio";
import PropGroupSetting from "../PropGroupSetting";
import PropItemSetting from "../PropItemSetting";
import PropBlockSetting from "../PropBlockSetting";
import SubStudio from "../SubStudio";



const SidePanel: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  // 使用页面全局实例
  const [studioModel] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');

  const containerRef = useRef<HTMLDivElement>({} as any);

  return <div {...props} ref={containerRef}>

    <SideHeader className={styles.headerContainer} />
    <SideToolBar className={styles.toolBar} />

    <div className={`${styles.studioContainer} `}>
      <div className={`${styles.studioItem}  `}>
        <Studio />
      </div>

      {
        studioModel.propItemStack.map(item => {
          return (
            <div key={item.id} className={`${styles.studioItem} ${styles.cascaderStudio} `}>
              <SubStudio key={item.id} item={item} />
            </div>
          )
        })
      }
    </div>

    <SideFooter className={`${styles.footerContainer} ${workbenchModel.stageMode ? styles.editMode : ''}`} />

    <PropGroupSetting />
    <PropBlockSetting />
    <PropItemSetting />

    <MouseFollow
      cursor="col-resize"
      className={styles.moveHandle}
      start={() => {
        containerRef.current.parentElement.classList.add('drag-active');
        return containerRef.current.getBoundingClientRect().width;
      }}
      move={(x, _y, originData) => {
        const width = originData - x;
        let sideWidth = width;

        if (width <= workbenchModel.minSideWidth) {
          sideWidth = workbenchModel.minSideWidth;
        }
        containerRef.current.parentElement!.style.setProperty('--side-width', `${sideWidth}px`);
      }}
      end={() => {
        containerRef.current.parentElement.classList.remove('drag-active');
      }}
    />
  </div>
}

export default SidePanel;