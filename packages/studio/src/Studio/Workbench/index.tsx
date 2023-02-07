
import styles from './index.module.less';
import { GridLayout, GrootCommandType, GrootStateType } from '@grootio/common';
import { useEffect, useReducer } from 'react';
import { commandManager, stateManager } from 'Studio/groot';



const Workbench: React.FC<{ layout: GridLayout }> = ({ layout }) => {
  const [, refresh] = useReducer((tick) => ++tick, 1);
  const { useStateByName } = stateManager<GrootStateType>();
  const { executeCommand } = commandManager<GrootCommandType>();
  const [containerStyle] = useStateByName('groot.state.workbench.style.container', {});
  const [toolBarStyle] = useStateByName('groot.state.workbench.style.toolBar', {});
  const [activityBarStyle] = useStateByName('groot.state.workbench.style.activityBar', {});
  const [primarySidebarStyle] = useStateByName('groot.state.workbench.style.primarySidebar', {});
  const [secondarySidebarStyle] = useStateByName('groot.state.workbench.style.secondarySidebar', {});
  const [stageStyle] = useStateByName('groot.state.workbench.style.stage', {});
  const [panelStyle] = useStateByName('groot.state.workbench.style.panel', {});
  const [statusBarStyle] = useStateByName('groot.state.workbench.style.statusBar', {});

  useEffect(() => {
    return layout.watch(() => {
      refresh();
    });
  }, []);

  return <div className={styles.container} style={{ ...containerStyle, ...layout.styles }}>
    <div className={styles.toolBar} style={toolBarStyle}>
      {executeCommand('groot.command.workbench.render.toolBar')}
    </div>
    <div className={styles.activityBar} style={activityBarStyle}>
      {executeCommand('groot.command.workbench.render.activityBar')}
    </div>
    <div className={styles.primarySidebar} style={primarySidebarStyle}>
      {executeCommand('groot.command.workbench.render.primarySidebar')}
    </div>
    <div className={styles.secondarySidebar} style={secondarySidebarStyle}>
      {executeCommand('groot.command.workbench.render.secondarySidebar')}
    </div>
    <div className={styles.stage} style={stageStyle}>
      {executeCommand('groot.command.workbench.render.stage')}
    </div>
    <div className={styles.panel} style={panelStyle}>
      {executeCommand('groot.command.workbench.render.panel')}
    </div>
    <div className={styles.statusBar} style={statusBarStyle}>
      {executeCommand('groot.command.workbench.render.statusBar')}
    </div>
  </div>
}


export default Workbench;