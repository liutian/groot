
import styles from './index.module.less';
import { Button } from "antd";
import { GridLayout, GrootCommandType, GrootStateType } from '@grootio/common';
import { useEffect, useReducer } from 'react';
import { commandManager, stateManager } from 'Studio/groot';



const Workbench: React.FC<{ layout: GridLayout }> = ({ layout }) => {
  const [, refresh] = useReducer((tick) => ++tick, 1);
  const { useStateByName } = stateManager<GrootStateType>();
  const { executeCommand } = commandManager<GrootCommandType>();
  const containerStyle = useStateByName('groot.state.workbench.style.container', {});
  const toolBarStyle = useStateByName('groot.state.workbench.style.toolBar', {});
  const activityBarStyle = useStateByName('groot.state.workbench.style.activityBar', {});
  const primarySidebarStyle = useStateByName('groot.state.workbench.style.primarySidebar', {});
  const secondarySidebarStyle = useStateByName('groot.state.workbench.style.secondarySidebar', {});
  const editorStyle = useStateByName('groot.state.workbench.style.editor', {});
  const panelStyle = useStateByName('groot.state.workbench.style.panel', {});
  const statusBarStyle = useStateByName('groot.state.workbench.style.statusBar', {});

  useEffect(() => {
    return layout.watch(() => {
      refresh();
    });
  }, []);

  return <div className={styles.container} style={{ ...containerStyle, ...layout.styles }}>
    <div className={styles.toolBar} style={toolBarStyle}></div>
    <div className={styles.activityBar} style={activityBarStyle}>
      {executeCommand('groot.command.workbench.render.activityBar')}
    </div>
    <div className={styles.primarySidebar} style={primarySidebarStyle}></div>
    <div className={styles.secondarySidebar} style={secondarySidebarStyle}></div>
    <div className={styles.editor} style={editorStyle}>
      <Button onClick={() => layout.design('visible', 'activityBar', !layout.layoutSetting.activityBar)}>活动栏</Button>
      <Button onClick={() => layout.design('visible', 'primarySidebar', !layout.layoutSetting.primarySidebar)}>主侧栏</Button>
      <Button onClick={() => layout.design('visible', 'secondarySidebar', !layout.layoutSetting.secondarySidebar)}>辅助侧边栏</Button>
      <Button onClick={() => layout.design('visible', 'panel', !layout.layoutSetting.panel)}>面板</Button>
      <Button onClick={() => layout.design('visible', 'statusBar', !layout.layoutSetting.statusBar)}>状态栏</Button>
      <Button onClick={() => layout.design('visible', 'toolBar', !layout.layoutSetting.toolBar)}>工具栏</Button>

      <br />

      <Button onClick={() => layout.design('primary', 'left', null)}>主侧栏左边</Button>
      <Button onClick={() => layout.design('primary', 'right', null)}>主侧栏右边</Button>

      <br />

      <Button onClick={() => layout.design('toolBar', 'left', null)}>工具栏靠左</Button>
      <Button onClick={() => layout.design('toolBar', 'right', null)}>工具栏靠右</Button>
      <Button onClick={() => layout.design('toolBar', 'center', null)}>工具栏居中</Button>
      <Button onClick={() => layout.design('toolBar', 'stretch', null)}>工具栏两端</Button>

      <br />

      <Button onClick={() => layout.design('panel', 'left', null)}>面板靠左</Button>
      <Button onClick={() => layout.design('panel', 'right', null)}>面板靠右</Button>
      <Button onClick={() => layout.design('panel', 'center', null)}>面板居中</Button>
      <Button onClick={() => layout.design('panel', 'stretch', null)}>面板两端</Button>

    </div>
    <div className={styles.panel} style={panelStyle}></div>
    <div className={styles.statusBar} style={statusBarStyle}></div>
  </div>
}


export default Workbench;