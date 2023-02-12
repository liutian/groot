import { MouseFollow, useRegisterModel } from "@grootio/common";
import PropBlockSetting from "./PropBlockSetting";
import PropGroupSetting from "./PropGroupSetting";
import PropItemSetting from "./PropItemSetting";

import styles from './index.module.less'
import { useRef, useState } from "react";
import PropPane from "./PropPane";
import { grootStateManager } from "context";
import SubPropPane from "./SubPropPane";
import PropPersistModel from "./PropPersistModel";
import PropHandleModel from "./PropHandleModel";

export const PropSetter = () => {
  const propPersistModel = useRegisterModel(PropPersistModel);
  const propHandleModel = useRegisterModel(PropHandleModel);
  useState(() => {
    propPersistModel.inject(propHandleModel)
    propHandleModel.inject(propPersistModel);
  });

  const [component] = grootStateManager().useStateByName('gs.studio.component');

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
            {!!component ? <PropPane /> : <>loading ...</>}
          </div>
        )
      }
    </div>

    {/* <PropFooter className={styles.footerContainer} /> */}

    <PropGroupSetting />
    <PropBlockSetting />
    <PropItemSetting />

    <MouseFollow
      cursor="col-resize"
      className={styles.moveHandle}
      start={() => {
        // workbenchModel.toggleWorkAreaMask(true);
        return containerRef.current.getBoundingClientRect().width;
      }}
      move={(x, _y, originData) => {
        const width = originData - x;
        let sideWidth = width;

        // if (width <= workbenchModel.minSideWidth) {
        //   sideWidth = workbenchModel.minSideWidth;
        // }
        // workbenchModel.setContainerCssVar('--side-width', `${sideWidth}px`);
      }}
      end={() => {
        // workbenchModel.toggleWorkAreaMask(false);
      }}
    />
  </div >
}