import { GrootStateType, viewRender, viewRenderById, ViewsContainerType } from "@grootio/common";
import { groot } from "index";

const ViewsContainer: React.FC<{ context: ViewsContainerType }> = ({ context }) => {
  const { useStateByName } = groot.stateManager<GrootStateType>();
  const [viewList] = useStateByName('groot.state.ui.views', []);
  const childrenView = viewList.filter(item => item.parent === context.id)

  return <>{
    childrenView.map(item => viewRenderById(item.id, item.view))
  }</>
}

export default ViewsContainer;