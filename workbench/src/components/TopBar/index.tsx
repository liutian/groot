import { DesktopOutlined, MobileOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';

import { useModel, ViewportMode } from '@grootio/common';
import WorkbenchModel from '@model/WorkbenchModel';

import styles from './index.module.less';

const TopBar: React.FC = () => {
  const workbenchModel = useModel(WorkbenchModel);

  return <div className={styles.container}>
    <Space style={{ flexGrow: 1 }}>
      <Button icon={<DesktopOutlined />} size="small"
        onClick={() => workbenchModel.setViewportMode(ViewportMode.PC)}
        type={workbenchModel.viewportMode === ViewportMode.PC ? 'link' : 'text'} />
      <Button icon={<MobileOutlined />} size="small"
        onClick={() => workbenchModel.setViewportMode(ViewportMode.H5)}
        type={workbenchModel.viewportMode === ViewportMode.H5 ? 'link' : 'text'} />
      <Button icon={<RedoOutlined rotate={-90} />} size="small" type="text"
        onClick={() => workbenchModel.refresh()}
      />
    </Space>

    <Space>
      {workbenchModel.renderToolBarAction()}
    </Space>
  </div>
}

export default TopBar;