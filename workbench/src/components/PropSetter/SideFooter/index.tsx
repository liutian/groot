import { BellOutlined, BlockOutlined, BranchesOutlined, CommentOutlined, NumberOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from '@util/robot';
import { Dropdown, Menu, Typography } from 'antd';
import { HTMLAttributes, useEffect, useRef } from 'react';
import styles from './index.module.less';

import WorkbenchModel from '@model/WorkbenchModel';

const SideFooter: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const [workbenchModel, workbenchUpdateAction] = useModel(WorkbenchModel);
  const propPathChainRef = useRef<HTMLElement>();

  useEffect(() => {
    workbenchUpdateAction(() => {
      workbenchModel.propPathChainEle = propPathChainRef.current;
    }, false)
  }, [propPathChainRef.current])

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
      {
        workbenchModel.renderFooterLeftActionItems.map((render, index) => {
          return <div className={styles.actionItem} key={index}>
            {render()}
          </div>
        })
      }
    </div>
    <Typography.Text ellipsis={{ tooltip: 'columns.[].form.lable' }} className={styles.propPathChain} >
      <NumberOutlined />&nbsp;
      <span ref={propPathChainRef}></span>
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