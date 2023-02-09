import { AppstoreOutlined } from "@ant-design/icons";
import { GrootStateDict } from "@grootio/common";
import { getContext } from "context";
import ViewsContainer from "core/ViewsContainer";
import { PropSetter } from "share/PropSetter";
import { WorkArea } from "share/WorkArea";
import { Solution } from "./Solution";

export const prototypeBootstrap = () => {
  const { groot } = getContext();
  const { registerState } = groot.stateManager<GrootStateDict>();

  registerState('gs.ui.viewsContainers', [
    {
      id: 'solution',
      name: '组件',
      icon: () => {
        return <AppstoreOutlined />
      },
      view: function () {
        return <ViewsContainer context={this} />
      },
    }, {
      id: 'propSetter',
      name: '属性设置器',
      view: function () {
        return <ViewsContainer context={this} />
      }
    }, {
      id: 'workArea',
      name: '工作区',
      view: function () {
        return <ViewsContainer context={this} />
      }
    }
  ])

  registerState('gs.ui.views', [
    {
      id: 'solutio',
      name: '组件',
      view: <Solution />,
      parent: 'solution'
    }, {
      id: 'propSetter',
      name: '属性设置器',
      view: <PropSetter />,
      parent: 'propSetter'
    }, {
      id: 'workArea',
      name: '工作区',
      view: <WorkArea />,
      parent: 'workArea'
    }
  ])


  registerState('gs.workbench.activityBar.view', ['solution'])
  registerState('gs.workbench.activityBar.active', 'solution');
  registerState('gs.workbench.primarySidebar.view', 'solution');
  registerState('gs.workbench.secondarySidebar.view', 'propSetter');
  registerState('gs.workbench.stage.view', 'workArea');

  groot.layout.design('visible', 'secondarySidebar', true);
  groot.layout.design('visible', 'panel', false);
}