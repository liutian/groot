import { viewRender } from "@grootio/common";
import { grootStateManager } from "context";

const Stage = () => {
  const { useStateByName } = grootStateManager();
  const [viewsContainers] = useStateByName('gs.ui.views', []);
  const [viewKey] = useStateByName('gs.workbench.stage.view', '');
  const view = viewsContainers.find(item => item.id === viewKey)?.view

  return <>{viewRender(view)}</>
}

export default Stage;