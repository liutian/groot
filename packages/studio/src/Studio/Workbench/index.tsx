import { StudioEvent, useModel, useRegisterModel } from "@grootio/common";
import { useEffect } from "react";
import StudioModel from "Studio/StudioModel";

import WorkbenchModel from "./WorkbenchModel";
import styles from './index.module.less';
import { Button } from "antd";

const Workbench: React.FC = () => {
  const studioModel = useModel(StudioModel);
  const workbenchModel = useRegisterModel(WorkbenchModel);

  useEffect(() => {
    studioModel.workbenchModel = workbenchModel;
    studioModel.dispatchEvent(new Event(StudioEvent.LaunchFinish));
  }, [])

  return <div className={styles.container} style={workbenchModel.layout.styles}>
    <div className={styles.toolBar}>toolBar</div>
    <div className={styles.activityBar}>activityBar</div>
    <div className={styles.primarySidebar}>primarySidebar</div>
    <div className={styles.secondarySidebar}>secondarySidebar</div>
    <div className={styles.editor}>
      <Button onClick={() => workbenchModel.layout.design('visible', 'activityBar', !workbenchModel.layout.layoutSetting.activityBar)}>活动栏</Button>
      <Button onClick={() => workbenchModel.layout.design('visible', 'primarySidebar', !workbenchModel.layout.layoutSetting.primarySidebar)}>主侧栏</Button>
      <Button onClick={() => workbenchModel.layout.design('visible', 'secondarySidebar', !workbenchModel.layout.layoutSetting.secondarySidebar)}>辅助侧边栏</Button>
      <Button onClick={() => workbenchModel.layout.design('visible', 'panel', !workbenchModel.layout.layoutSetting.panel)}>面板</Button>
      <Button onClick={() => workbenchModel.layout.design('visible', 'statusBar', !workbenchModel.layout.layoutSetting.statusBar)}>状态栏</Button>
      <Button onClick={() => workbenchModel.layout.design('visible', 'toolBar', !workbenchModel.layout.layoutSetting.toolBar)}>工具栏</Button>

      <br />

      <Button onClick={() => workbenchModel.layout.design('primary', 'left', null)}>主侧栏左边</Button>
      <Button onClick={() => workbenchModel.layout.design('primary', 'right', null)}>主侧栏右边</Button>

      <br />

      <Button onClick={() => workbenchModel.layout.design('toolBar', 'left', null)}>工具栏靠左</Button>
      <Button onClick={() => workbenchModel.layout.design('toolBar', 'right', null)}>工具栏靠右</Button>
      <Button onClick={() => workbenchModel.layout.design('toolBar', 'center', null)}>工具栏居中</Button>
      <Button onClick={() => workbenchModel.layout.design('toolBar', 'stretch', null)}>工具栏两端</Button>

      <br />

      <Button onClick={() => workbenchModel.layout.design('panel', 'left', null)}>面板靠左</Button>
      <Button onClick={() => workbenchModel.layout.design('panel', 'right', null)}>面板靠右</Button>
      <Button onClick={() => workbenchModel.layout.design('panel', 'center', null)}>面板居中</Button>
      <Button onClick={() => workbenchModel.layout.design('panel', 'stretch', null)}>面板两端</Button>

    </div>
    <div className={styles.panel}>panel</div>
    <div className={styles.statusBar}>statusBar</div>
  </div>
}


export default Workbench;