import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { useEffect, useRef } from "react";

import styles from './index.module.less';
import Viewport from "./Viewport";

const WorkArea: React.FC = () => {
  const [workbenchModel, workbenchUpdateAction] = useModel(WorkbenchModel);
  const maskEleRef = useRef();

  useEffect(() => {
    workbenchUpdateAction(() => {
      workbenchModel.workAreaMaskEle = maskEleRef.current;
    })
  }, []);

  return <div className={styles.container}>
    <Viewport />
    {/* 防止拖拽缩放过程中由于鼠标移入iframe中丢失鼠标移动事件 */}
    <div id="work-area-mask" ref={maskEleRef} ></div>
  </div>
}

export default WorkArea;