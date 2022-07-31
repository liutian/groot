import { HomeOutlined, SendOutlined } from "@ant-design/icons";
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
        <Breadcrumb.Item href="">子组件</Breadcrumb.Item>
      </Breadcrumb>
    </div>
    <div className={styles.actions} >
      <Button type="link" title="部署" icon={<SendOutlined />} />
    </div>
  </div>
}

export default SideToolBar;