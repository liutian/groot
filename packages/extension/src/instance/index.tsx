import { AppstoreOutlined } from "@ant-design/icons";
import { ExtensionContext, GrootStateType } from "@grootio/common";
import ViewsContainer from "core/ViewsContainer";
import { PropSetter } from "share/PropSetter";
import { WorkArea } from "share/WorkArea";
import { Application } from "./Application";
import { Material } from "./Material";

export const instanceBootstrap = ({ groot }: ExtensionContext) => {
  const { registerState } = groot.stateManager<GrootStateType>();

  registerState('groot.state.ui.viewsContainers', [
    {
      id: 'application',
      name: '页面',
      icon: () => {
        return <AppstoreOutlined />
      },
      view: function () {
        return <ViewsContainer context={this} />
      },
    }, {
      id: 'material',
      name: '物料',
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
      },
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
      id: 'application',
      name: '页面',
      view: <Application />,
      parent: 'application'
    }, {
      id: 'material',
      name: '物料',
      view: <Material />,
      parent: 'material'
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

  registerState('groot.state.workbench.activityBar.view', [
    'application', 'material'
  ])
  registerState('groot.state.workbench.activityBar.active', 'application');
  registerState('groot.state.workbench.primarySidebar.view', 'application');
  registerState('groot.state.workbench.secondarySidebar.view', 'propSetter');
  registerState('groot.state.workbench.stage.view', 'workArea');

  groot.layout.design('visible', 'secondarySidebar', true);
  groot.layout.design('visible', 'panel', false);
}