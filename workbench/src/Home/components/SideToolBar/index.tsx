import { CodeFilled, CodeOutlined, DashboardFilled, DashboardOutlined, HomeOutlined, SendOutlined, SettingFilled, SettingOutlined } from "@ant-design/icons";
import StudioModel from "@model/StudioModel";
import { useModel } from "@util/robot";
import { Breadcrumb, Button } from "antd";
import { HTMLAttributes } from "react";

import styles from './index.module.less';

const SideToolBar: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const [model] = useModel<StudioModel>('studio');

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
      <Button type="link" title="源码" icon={model.manualMode ? <CodeFilled /> : <CodeOutlined />} onClick={() => model.switchManualMode()} />
      <Button type="link" title="json" icon={model.jsonMode ? <DashboardFilled /> : <DashboardOutlined />} onClick={() => model.switchJSONMode()} />
      <Button type="link" title="设置" icon={model.editMode ? <SettingFilled /> : <SettingOutlined />} onClick={() => model.switchEditMode()} />
    </div>
  </div>
}

export default SideToolBar;