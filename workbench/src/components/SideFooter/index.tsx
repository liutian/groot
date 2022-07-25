import { BellOutlined, BlockOutlined, BranchesOutlined, CommentOutlined, NumberOutlined } from '@ant-design/icons';
import { useModel } from '@util/robot';
import { Typography } from 'antd';
import { HTMLAttributes } from 'react';
import styles from './index.module.less';

import WorkbenchModel from '@model/WorkbenchModel';
import PropHandleModel from '@model/PropHandleModel';

const SideFooter: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const [workbenchModel, workbenchUpdateAction] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
  const [propHandleModel] = useModel<PropHandleModel>(PropHandleModel.modelName);

  const switchWidgetWidnwo = () => {
    workbenchUpdateAction(() => {
      if (workbenchModel.widgetWindowRect === 'none') {
        workbenchModel.widgetWindowRect = 'normal';
      } else {
        workbenchModel.widgetWindowRect = 'none';
      }
    });
  }

  return <div {...props}>
    <div >
      <div className={styles.actionItem}>
        <BranchesOutlined title="版本" />
        <span>{workbenchModel.component?.version.name}</span>
      </div>
    </div>
    <Typography.Text ellipsis={{ tooltip: 'columns.[].form.lable' }} className={styles.content} >
      <NumberOutlined />&nbsp;
      <span>{propHandleModel.activePropItemPath}</span>
    </Typography.Text>
    <div >
      <div className={styles.actionItem} onClick={switchWidgetWidnwo}>
        <BlockOutlined title="窗口" />
      </div>
      <div className={styles.actionItem}>
        <CommentOutlined title="反馈" />
      </div>
      <div className={styles.actionItem}>
        <BellOutlined title="通知" />
      </div>
    </div>
  </div>
}

export default SideFooter;