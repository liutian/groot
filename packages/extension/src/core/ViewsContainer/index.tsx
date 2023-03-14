import { viewRender, ViewContainerItem } from "@grootio/common";
import { grootStateManager } from "context";

const ViewsContainer: React.FC<{ context: ViewContainerItem }> = ({ context }) => {
  const { useStateByName } = grootStateManager();
  const [viewList] = useStateByName('gs.ui.views', []);
  const childrenView = viewList.filter(item => item.parent === context.id)

  return <>{
    childrenView.map(item => viewRender(item.view, item.id))
  }</>
}

export default ViewsContainer;