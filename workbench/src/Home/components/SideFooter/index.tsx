import { BellOutlined, BlockOutlined, BranchesOutlined, CommentOutlined, NumberOutlined } from '@ant-design/icons';
import { useModel } from '@util/robot';
import { Typography } from 'antd';
import { HTMLAttributes } from 'react';
import styles from './index.module.less';

import WorkbenchModel from '@model/WorkbenchModel';

const SideFooter: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const [studioModel, updateAction] = useModel<WorkbenchModel>('workbench');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');

  const switchWidgetWidnwo = () => {
    updateAction(() => {
      if (studioModel.widgetWindowRect === 'none') {
        studioModel.widgetWindowRect = 'normal';
      } else {
        studioModel.widgetWindowRect = 'none';
      }
    });
  }

  return <div {...props}>
    <div >
      <div className={styles.actionItem}>
        <BranchesOutlined title="版本" />
        <span>{workbenchModel.component.version.name}</span>
      </div>
    </div>
    <Typography.Text ellipsis={{ tooltip: 'columns.[].form.lable' }} className={styles.content} >
      <NumberOutlined />&nbsp;
      <span>{workbenchModel.activePropItemPath}</span>
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