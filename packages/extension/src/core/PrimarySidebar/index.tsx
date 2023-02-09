import { GrootStateDict, viewRender } from "@grootio/common";
import { getContext } from "context";

const PrimarySidebar = () => {
  const { groot } = getContext();
  const { useStateByName } = groot.stateManager<GrootStateDict>();
  const [viewsContainers] = useStateByName('gs.ui.viewsContainers', []);
  const [viewKey] = useStateByName('gs.workbench.primarySidebar.view', '');
  const view = viewsContainers.find(item => item.id === viewKey)?.view

  return <>{viewRender(view)}</>
}

export default PrimarySidebar;