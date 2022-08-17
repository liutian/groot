import { BellOutlined, BlockOutlined, BranchesOutlined, CommentOutlined, NumberOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from '@util/robot';
import { Dropdown, Menu, Typography } from 'antd';
import { HTMLAttributes, useEffect, useRef } from 'react';
import styles from './index.module.less';

import WorkbenchModel from '@model/WorkbenchModel';

const SideFooter: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const [workbenchModel, workbenchUpdateAction] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
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

  const versionListMenu = workbenchModel.component?.versionList.map((version) => {
    return {
      key: version.id,
      label: (<a onClick={() => workbenchModel.switchComponent(workbenchModel.component.id, version.id)}>{version.name}</a>)
    }
  })

  return <div {...props}>
    <div >
      <Dropdown className={styles.actionItem} placement="topLeft" overlay={<Menu items={versionListMenu} />}>
        <span>
          <BranchesOutlined title="版本" />
          <span>{workbenchModel.component?.version.name}</span>
        </span>
      </Dropdown>

      {
        workbenchModel.footerLeftActionItems.map((actionItem, index) => {
          return <div className={styles.actionItem} key={index}>
            {actionItem}
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