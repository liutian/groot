import { Button, Radio, Space } from "antd"
import { grootStateManager } from "context"

import styles from './index.module.less'

const ToolBar = () => {
  const [viewportMode, setViewportMode] = grootStateManager().useStateByName('gs.workbench.stage.viewport')
  return <div className={styles.container}>

    <Space>
      <Radio.Group size="small" value={viewportMode} >
        <Radio.Button value="desktop" onClick={() => setViewportMode('desktop')}>桌面</Radio.Button>
        <Radio.Button value="mobile" onClick={() => setViewportMode('mobile')}>手机</Radio.Button>
      </Radio.Group>

      <Button size="small">预览</Button>
    </Space>
  </div>
}

export default ToolBar