import { useRef } from "react";

import WorkbenchModel from "@model/WorkbenchModel";
import PropHandleModel from "@model/PropHandleModel";

import MouseFollow from "components/MouseFollow";
import styles from './index.module.less';
import PropFooter from "./PropFooter";
import PropPane from "./PropPane";
import PropGroupSetting from "./PropGroupSetting";
import PropItemSetting from "./PropItemSetting";
import PropBlockSetting from "./PropBlockSetting";
import SubPropPane from "./SubPropPane";
import { useModel } from "@grootio/common";


const PropSetter: React.FC = () => {
  const propHandleModel = useModel(PropHandleModel);
  const workbenchModel = useModel(WorkbenchModel);

  const containerRef = useRef<HTMLDivElement>({} as any);

  const activeSubPropItem = propHandleModel.propItemStack[propHandleModel.propItemStack.length - 1];

  return <div ref={containerRef} className={styles.container}>
    <div className={styles.propContainer}>

      {
        propHandleModel.propItemStack.length ? (
          <div key={activeSubPropItem.id} className={`${styles.propPaneItem}`}>
            <SubPropPane key={activeSubPropItem.id} item={activeSubPropItem} />
          </div>
        ) : (
          <div className={`${styles.propPaneItem}  `}>
            {!!workbenchModel.component ? <PropPane /> : <>loading ...</>}
          </div>
        )
      }
    </div>

    <PropFooter className={styles.footerContainer} />

    <PropGroupSetting />
    <PropBlockSetting />
    <PropItemSetting />

    <MouseFollow
      cursor="col-resize"
      className={styles.moveHandle}
      start={() => {
        workbenchModel.toggleWorkAreaMask(true);
        return containerRef.current.getBoundingClientRect().width;
      }}
      move={(x, _y, originData) => {
        const width = originData - x;
        let sideWidth = width;

        if (width <= workbenchModel.minSideWidth) {
          sideWidth = workbenchModel.minSideWidth;
        }
        workbenchModel.setContainerCssVar('--side-width', `${sideWidth}px`);
      }}
      end={() => {
        workbenchModel.toggleWorkAreaMask(false);
      }}
    />
  </div >
}

export default PropSetter;