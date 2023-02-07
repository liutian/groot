import { GrootStateType, viewRender } from "@grootio/common";
import { groot } from "index";
import styles from './index.module.less';


const ActivityBar: React.FC = () => {
  const { useStateByName } = groot.stateManager<GrootStateType>();
  const [viewKeys] = useStateByName('groot.state.workbench.activityBar.view', []);
  const [viewsContainers] = useStateByName('groot.state.ui.viewsContainers', []);
  const [active, setActive] = useStateByName('groot.state.workbench.activityBar.active');
  const [, setPrimarySidebarKey] = useStateByName('groot.state.workbench.primarySidebar.view');

  const items = viewsContainers.filter(vc => {
    return viewKeys.includes(vc.id)
  })

  const change = (key: string) => {
    setActive(key);
    setPrimarySidebarKey(key);
  }

  return <div className={styles.container}>

    <div className={styles.topContainer}>
      {items.map((item) => {
        return <span key={item.id} onClick={() => change(item.id)} className={`${styles.iconItem} ${active === item.id ? 'active' : ''}`}>
          {viewRender(item.icon)}
        </span>
      })}
    </div>
  </div>
}

export default ActivityBar;