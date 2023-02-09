import { GrootStateDict, viewRender } from "@grootio/common";
import { Tabs } from "antd";
import { getContext } from "context";

const Panel = () => {
  const { groot } = getContext();
  const { useStateByName } = groot.stateManager<GrootStateDict>();
  const [viewsContainers] = useStateByName('gs.ui.viewsContainers', []);
  const [viewKeyList] = useStateByName('gs.workbench.panel.view', []);
  const viewList = viewsContainers.filter(item => viewKeyList.includes(item.id));

  return <>
    <Tabs items={viewList.map(item => {
      return {
        key: item.id,
        label: viewRender(item.name),
        children: viewRender(item.view)
      }
    })} />
  </>
}

export default Panel;