import { GrootStateType, viewRender } from "@grootio/common";
import { Tabs } from "antd";
import { groot } from "index";

const Panel = () => {
  const { useStateByName } = groot.stateManager<GrootStateType>();
  const [viewsContainers] = useStateByName('groot.state.ui.viewsContainers', []);
  const [viewKeyList] = useStateByName('groot.state.workbench.panel.view', []);
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