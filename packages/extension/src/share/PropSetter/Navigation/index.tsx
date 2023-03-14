import { HomeOutlined } from "@ant-design/icons";
import { PostMessageType } from "@grootio/common";
import { Breadcrumb } from "antd";
import { grootCommandManager, grootHookManager, grootStateManager } from "context";

import styles from './index.module.less'

export const Navigation = () => {
  const { useStateByName } = grootStateManager()
  const { callHook } = grootHookManager()
  const { executeCommand } = grootCommandManager()

  const [breadcrumbList] = useStateByName('gs.propSetting.breadcrumbList', []);

  return <div className={styles.container}>
    <Breadcrumb separator=">">
      {
        breadcrumbList.map((item, index) => {
          return (<Breadcrumb.Item key={item.id} className={styles.breadcrumbItem}
            onClick={() => {
              if (index === breadcrumbList.length - 1) {
                return;
              } else if (index > 0) {
                callHook(PostMessageType.OuterComponentSelect, item.id)
              } else {
                // 根组件不需要选择效果，直接切换，并清空标记
                executeCommand('gc.switchIstance', item.id)
                callHook(PostMessageType.OuterOutlineReset)
              }
            }}>
            {index === 0 ? (<><HomeOutlined /></>) : item.name}
          </Breadcrumb.Item>)
        })
      }
    </Breadcrumb>
  </div>
}

