import { GrootStateType, viewRender } from "@grootio/common";
import { groot } from "index";

const PrimarySidebar = () => {
  const { useStateByName } = groot.stateManager<GrootStateType>();
  const [viewsContainers] = useStateByName('groot.state.ui.viewsContainers', []);
  const [viewKey] = useStateByName('groot.state.workbench.primarySidebar.view');
  const view = viewsContainers.find(item => item.id === viewKey)?.view

  return <>{viewRender(view)}</>
}

export default PrimarySidebar;