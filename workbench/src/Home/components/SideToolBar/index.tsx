import { CodeOutlined, DashboardOutlined, HomeOutlined, SendOutlined, SettingOutlined } from "@ant-design/icons";
import { Breadcrumb, Button } from "antd";
import { HTMLAttributes } from "react";

import styles from './index.module.less';

const SideToolBar: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
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
      <Button type="link" title="源码" icon={<CodeOutlined />} />
      <Button type="link" title="json模式" icon={<DashboardOutlined />} />
      <Button type="link" title="设置" icon={<SettingOutlined />} />
    </div>
  </div>
}

export default SideToolBar;