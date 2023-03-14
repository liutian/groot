import { viewRender } from "@grootio/common";
import { grootStateManager } from "context";

const SecondarySidebar = () => {
  const { useStateByName } = grootStateManager();
  const [viewsContainers] = useStateByName('gs.ui.viewsContainers', []);
  const [viewKey] = useStateByName('gs.ui.secondarySidebar.active', '');
  const view = viewsContainers.find(item => item.id === viewKey)?.view

  return viewRender(view)
}

export default SecondarySidebar;