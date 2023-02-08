import { AppstoreOutlined } from "@ant-design/icons";
import { ExtensionContext, GrootStateType } from "@grootio/common";
import ViewsContainer from "core/ViewsContainer";
import { PropSetter } from "share/PropSetter";
import { WorkArea } from "share/WorkArea";
import { Solution } from "./Solution";

export const prototypeBootstrap = ({ groot }: ExtensionContext) => {
  const { registerState } = groot.stateManager<GrootStateType>();

  registerState('groot.state.ui.viewsContainers', [
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

  registerState('groot.state.ui.views', [
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


  registerState('groot.state.workbench.activityBar.view', ['solution'])
  registerState('groot.state.workbench.activityBar.active', 'solution');
  registerState('groot.state.workbench.primarySidebar.view', 'solution');
  registerState('groot.state.workbench.secondarySidebar.view', 'propSetter');
  registerState('groot.state.workbench.stage.view', 'workArea');

  groot.layout.design('visible', 'secondarySidebar', true);
  groot.layout.design('visible', 'panel', false);
}