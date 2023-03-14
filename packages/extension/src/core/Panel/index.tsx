import { viewRender } from "@grootio/common";
import { Tabs } from "antd";
import { grootStateManager } from "context";

const Panel = () => {
  const { useStateByName } = grootStateManager();
  const [viewsContainers] = useStateByName('gs.ui.viewsContainers', []);
  const [viewKeyList] = useStateByName('gs.ui.panel.viewsContainers', []);
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