import { GrootStateDict, viewRender } from "@grootio/common";
import { getContext } from "context";

const Stage = () => {
  const { groot } = getContext();
  const { useStateByName } = groot.stateManager<GrootStateDict>();
  const [viewsContainers] = useStateByName('gs.ui.views', []);
  const [viewKey] = useStateByName('gs.workbench.stage.view', '');
  const view = viewsContainers.find(item => item.id === viewKey)?.view

  return <>{viewRender(view)}</>
}

export default Stage;