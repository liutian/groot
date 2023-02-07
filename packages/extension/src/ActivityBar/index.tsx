import { GrootStateType } from "@grootio/common";
import { groot } from "index";

const ActivityBar: React.FC = () => {
  const views = groot.stateManager<GrootStateType>().useStateByName('groot.state.ui.views', []);

  return <>
    {views.map((item) => <item.value.view key={item.id} />)}
  </>
}

export default ActivityBar;