import { useEffect, useRef } from "react";

import WorkbenchModel from "@model/WorkbenchModel";

import styles from './index.module.less';
import Viewport from "./Viewport";
import { useModel } from "@grootio/common";

const WorkArea: React.FC = () => {
  const workbenchModel = useModel(WorkbenchModel);
  const maskEleRef = useRef();

  useEffect(() => {
    workbenchModel.workAreaMaskEle = maskEleRef.current;
  }, []);

  return <div className={styles.container}>
    <Viewport />
    {/* 防止拖拽缩放过程中由于鼠标移入iframe中丢失鼠标移动事件 */}
    <div id="work-area-mask" ref={maskEleRef} ></div>
  </div>
}

export default WorkArea;