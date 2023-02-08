import { GrootStateType, viewRender } from "@grootio/common";
import { groot } from "index";

const Stage = () => {
  const { useStateByName } = groot.stateManager<GrootStateType>();
  const [viewsContainers] = useStateByName('groot.state.ui.views', []);
  const [viewKey] = useStateByName('groot.state.workbench.stage.view', '');
  const view = viewsContainers.find(item => item.id === viewKey)?.view

  return <>{viewRender(view)}</>
}

export default Stage;