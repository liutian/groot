import { CodeFilled, CodeOutlined, DashboardFilled, DashboardOutlined, HomeOutlined, SendOutlined, SettingFilled, SettingOutlined } from "@ant-design/icons";
import StudioModel from "@model/StudioModel";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { Breadcrumb, Button } from "antd";
import { HTMLAttributes } from "react";

import styles from './index.module.less';

const SideToolBar: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const [studioModel] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');

  return <div {...props}>
    <div className={styles.breadcrumb}>
      <Breadcrumb separator=">">
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="">列表页面</Breadcrumb.Item>
        <Breadcrumb.Item href="">弹出框</Breadcrumb.Item>
      </Breadcrumb>
    </div>
    <div className={styles.actions} >
      <Button type="link" title="部署" icon={<SendOutlined />} />
      <Button type="link" title="源码" icon={workbenchModel.manualMode ? <CodeFilled /> : <CodeOutlined />} onClick={() => studioModel.switchManualMode()} />
      <Button type="link" title="json" icon={workbenchModel.jsonMode ? <DashboardFilled /> : <DashboardOutlined />} onClick={() => studioModel.switchJSONMode()} />
      <Button type="link" title="设置" icon={workbenchModel.stageMode ? <SettingFilled /> : <SettingOutlined />} onClick={() => studioModel.switchEditMode()} />
    </div>
  </div>
}

export default SideToolBar;