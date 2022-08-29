import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { HTMLAttributes } from "react";

import styles from './index.module.less';

const SideToolBar: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);

  return <div {...props}>
    <div className={styles.breadcrumb}>
      {workbenchModel.renderToolBarBreadcrumb()}
    </div>
    <div className={styles.actions} >
      {workbenchModel.renderToolBarAction()}
    </div>
  </div>
}

export default SideToolBar;