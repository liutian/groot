import { StudioEvent, useModel, useRegisterModel } from "@grootio/common";
import { useEffect } from "react";
import StudioModel from "Studio/StudioModel";

import WorkbenchModel from "./WorkbenchModel";
import styles from './index.module.less';

const Workbench: React.FC = () => {
  const studioModel = useModel(StudioModel);
  const workbenchModel = useRegisterModel(WorkbenchModel);

  useEffect(() => {
    studioModel.workbenchModel = workbenchModel;
    studioModel.dispatchEvent(new Event(StudioEvent.LaunchFinish));
  }, [])

  return <div className={styles.container}></div>
}

export default Workbench;