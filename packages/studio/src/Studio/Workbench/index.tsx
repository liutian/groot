
import styles from './index.module.less';
import { GridLayout, GrootCommandDict, GrootStateDict } from '@grootio/common';
import { useLayoutEffect, useRef } from 'react';
import { commandManager, stateManager } from 'Studio/groot';



const Workbench: React.FC<{ layout: GridLayout }> = ({ layout }) => {
  const { useStateByName } = stateManager<GrootStateDict>();
  const { executeCommand } = commandManager<GrootCommandDict>();
  const [containerStyle] = useStateByName('gs.ui.style.container', {});
  const [bannerStyle] = useStateByName('gs.ui.style.banner', {});
  const [activityBarStyle] = useStateByName('gs.ui.style.activityBar', {});
  const [primarySidebarStyle] = useStateByName('gs.ui.style.primarySidebar', {});
  const [secondarySidebarStyle] = useStateByName('gs.ui.style.secondarySidebar', {});
  const [stageStyle] = useStateByName('gs.ui.style.stage', {});
  const [panelStyle] = useStateByName('gs.ui.style.panel', {});
  const [statusBarStyle] = useStateByName('gs.ui.style.statusBar', {});
  const containerEleRef = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    refresh();
    layout.watch(refresh);

    function refresh() {
      const style = containerEleRef.current.style

      style['grid-template-columns'] = layout.styles.gridTemplateColumns;
      style['grid-template-rows'] = layout.styles.gridTemplateRows;
      style['grid-template-areas'] = layout.styles.gridTemplateAreas;
      style.setProperty('--groot-banner-height', layout.bannerHeight)
      style.setProperty('--groot-panel-height', layout.panelHeight)
      style.setProperty('--groot-status-bar-height', layout.statusBarHeight)
      style.setProperty('--groot-activity-bar-width', layout.activityBarWidth)
      style.setProperty('--groot-primary-sidebar-width', layout.primarySidebarWidth)
      style.setProperty('--groot-secondary-sidebar-width', layout.secondarySidebarWidth)
    }
  }, []);

  return <div className={styles.container} ref={containerEleRef} style={{ ...containerStyle }}>
    <div className={styles.banner} style={bannerStyle}>
      {executeCommand('gc.ui.render.banner')}
    </div>
    <div className={styles.activityBar} style={activityBarStyle}>
      {executeCommand('gc.ui.render.activityBar')}
    </div>
    <div className={styles.primarySidebar} style={primarySidebarStyle}>
      {executeCommand('gc.ui.render.primarySidebar')}
    </div>
    <div className={styles.secondarySidebar} style={secondarySidebarStyle}>
      {executeCommand('gc.ui.render.secondarySidebar')}
    </div>
    <div className={styles.stage} style={stageStyle}>
      {executeCommand('gc.ui.render.stage')}
    </div>
    <div className={styles.panel} style={panelStyle}>
      {executeCommand('gc.ui.render.panel')}
    </div>
    <div className={styles.statusBar} style={statusBarStyle}>
      {executeCommand('gc.ui.render.statusBar')}
    </div>
  </div>
}


export default Workbench;