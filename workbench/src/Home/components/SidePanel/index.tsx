import { HTMLAttributes, useRef } from "react";

import { useModel } from "@util/robot";
import StudioModel from '@model/StudioModel';

import styles from './index.module.less';
import SideHeader from "../SideHeader";
import SideToolBar from "../SideToolBar";
import SideFooter from "../SideFooter";
import Studio from "../Studio";
import MouseFollow from "components/MouseFollow"
import PropGroupSetting from "../PropGroupSetting";
import PropItemSetting from "../PropItemSetting";
import PropBlockSetting from "../PropBlockSetting";
import ArrayObjectPanel from "../ArrayObjectPanel";


const SidePanel: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  // 使用页面全局实例
  const [model] = useModel<StudioModel>('studio');

  const containerRef = useRef<HTMLDivElement>({} as any);

  return <div {...props} ref={containerRef}>

    <SideHeader className={styles.headerContainer} />
    <SideToolBar className={styles.navContainer} />

    <div className={`${styles.gridItemContainer}`}>
      <div className={`${styles.gridItem}  `}>
        {model.manualMode ? null : <Studio />}
      </div>

      {
        model.propItemStack.map(item => {
          return (
            <div key={item.id} className={`${styles.gridItem} ${styles.gridItemSub} `}>
              <ArrayObjectPanel key={item.id} item={item} />
            </div>
          )
        })
      }
    </div>


    <SideFooter className={styles.footerContainer} />

    <PropGroupSetting />
    <PropBlockSetting />
    <PropItemSetting />

    <MouseFollow
      cursor="col-resize"
      className={styles.moveHandle}
      start={() => {
        containerRef.current.parentElement!.classList.add('drag-active');
        return containerRef.current.getBoundingClientRect().width;
      }}
      move={(x, _y, originData) => {
        const width = originData - x;
        let sideWidth = width;

        if (width <= 480) {
          sideWidth = 480;
        } else if (width >= 1024) {
          sideWidth = 1024;
        }

        containerRef.current.parentElement!.style.setProperty('--side-width', `${sideWidth}px`);
      }}
      end={() => {
        containerRef.current.parentElement!.classList.remove('drag-active');
      }}
    />
  </div>
}

export default SidePanel;