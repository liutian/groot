import { useModel } from '@grootio/common';
import WorkbenchModel from '@model/WorkbenchModel';
import styles from './index.module.less';

const FooterBar: React.FC = () => {
  const workbenchModel = useModel(WorkbenchModel);

  return <>
    <div className={styles.title}>
      <div className={styles.breadcrumb}>
        {workbenchModel.renderToolBarBreadcrumb()}
      </div>
      <div className={styles.actions} >
      </div>
    </div>
    <div className={styles.content}></div>
  </>
}

export default FooterBar;