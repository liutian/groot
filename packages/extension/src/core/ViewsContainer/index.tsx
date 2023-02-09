import { GrootStateDict, viewRender, ViewsContainer } from "@grootio/common";
import { getContext } from "context";

const ViewsContainer: React.FC<{ context: ViewsContainer }> = ({ context }) => {
  const { groot } = getContext();
  const { useStateByName } = groot.stateManager<GrootStateDict>();
  const [viewList] = useStateByName('gs.ui.views', []);
  const childrenView = viewList.filter(item => item.parent === context.id)

  return <>{
    childrenView.map(item => viewRender(item.view, item.id))
  }</>
}

export default ViewsContainer;