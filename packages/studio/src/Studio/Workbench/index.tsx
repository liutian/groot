
import styles from './index.module.less';
import { GridLayout, GrootCommandDict, GrootStateDict } from '@grootio/common';
import { useEffect, useReducer } from 'react';
import { commandManager, stateManager } from 'Studio/groot';



const Workbench: React.FC<{ layout: GridLayout }> = ({ layout }) => {
  const [, refresh] = useReducer((tick) => ++tick, 1);
  const { useStateByName } = stateManager<GrootStateDict>();
  const { executeCommand } = commandManager<GrootCommandDict>();
  const [containerStyle] = useStateByName('gs.workbench.style.container', {});
  const [bannerStyle] = useStateByName('gs.workbench.style.banner', {});
  const [activityBarStyle] = useStateByName('gs.workbench.style.activityBar', {});
  const [primarySidebarStyle] = useStateByName('gs.workbench.style.primarySidebar', {});
  const [secondarySidebarStyle] = useStateByName('gs.workbench.style.secondarySidebar', {});
  const [stageStyle] = useStateByName('gs.workbench.style.stage', {});
  const [panelStyle] = useStateByName('gs.workbench.style.panel', {});
  const [statusBarStyle] = useStateByName('gs.workbench.style.statusBar', {});

  useEffect(() => {
    return layout.watch(() => {
      refresh();
    });
  }, []);

  return <div className={styles.container} style={{ ...containerStyle, ...layout.styles }}>
    <div className={styles.banner} style={bannerStyle}>
      {executeCommand('gc.workbench.banner.render')}
    </div>
    <div className={styles.activityBar} style={activityBarStyle}>
      {executeCommand('gc.workbench.activityBar.render')}
    </div>
    <div className={styles.primarySidebar} style={primarySidebarStyle}>
      {executeCommand('gc.workbench.primarySidebar.render')}
    </div>
    <div className={styles.secondarySidebar} style={secondarySidebarStyle}>
      {executeCommand('gc.workbench.secondarySidebar.render')}
    </div>
    <div className={styles.stage} style={stageStyle}>
      {executeCommand('gc.workbench.stage.render')}
    </div>
    <div className={styles.panel} style={panelStyle}>
      {executeCommand('gc.workbench.panel.render')}
    </div>
    <div className={styles.statusBar} style={statusBarStyle}>
      {executeCommand('gc.workbench.statusBar.render')}
    </div>
  </div>
}


export default Workbench;