import { viewRender } from "@grootio/common";
import { grootStateManager } from "context";

const PrimarySidebar = () => {
  const { useStateByName } = grootStateManager();
  const [viewsContainers] = useStateByName('gs.ui.viewsContainers', []);
  const [viewKey] = useStateByName('gs.ui.primarySidebar.active', '');
  const view = viewsContainers.find(item => item.id === viewKey)?.view

  return viewRender(view)
}

export default PrimarySidebar;