import { GrootStateType, viewRender, ViewsContainerType } from "@grootio/common";
import { groot } from "index";

const ViewsContainer: React.FC<{ context: ViewsContainerType }> = ({ context }) => {
  const { useStateByName } = groot.stateManager<GrootStateType>();
  const [viewList] = useStateByName('groot.state.ui.views', []);
  const childrenView = viewList.filter(item => item.parent === context.id)

  return <>{
    childrenView.map(item => viewRender(item.view, item.id))
  }</>
}

export default ViewsContainer;