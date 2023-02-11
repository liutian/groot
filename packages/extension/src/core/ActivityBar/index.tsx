import { viewRender } from "@grootio/common";
import { grootStateManager } from "context";
import styles from './index.module.less';


const ActivityBar: React.FC = () => {
  const { useStateByName } = grootStateManager();
  const [viewKeys] = useStateByName('gs.workbench.activityBar.viewsContainers', []);
  const [viewsContainers] = useStateByName('gs.ui.viewsContainers', []);
  const [active, setActive] = useStateByName('gs.workbench.activityBar.active', '');
  const [, setPrimarySidebarKey] = useStateByName('gs.workbench.primarySidebar.viewsContainer', '');

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