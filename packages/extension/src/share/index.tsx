import { commandBridge, getContext, grootCommandManager, grootStateManager, isPrototypeMode } from "context";
import ViewsContainer from "core/ViewsContainer";
import { PropSetter } from "./PropSetter";
import ToolBar from "./ToolBar";
import { WorkArea } from "./WorkArea";


export const shareBootstrap = () => {
  const { groot } = getContext();
  const { registerState } = grootStateManager();


  registerState('gs.ui.viewsContainers', [
    {
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
  ], true)

  registerState('gs.ui.views', [
    {
      id: 'propSetter',
      name: '属性设置器',
      view: <PropSetter />,
      parent: 'propSetter'
    }, {
      id: 'workArea',
      name: '工作区',
      view: <WorkArea />,
      parent: 'workArea'
    }, {
      id: 'toolBar',
      name: '工具栏',
      view: <ToolBar />,
    }
  ], true)

  registerState('gs.workbench.secondarySidebar.viewsContainer', 'propSetter', false);
  registerState('gs.workbench.stage.view', 'workArea', false);
  registerState('gs.workbench.banner.views', [
    { id: 'toolBar', placement: 'center' }
  ], true)
  registerState('gs.workbench.stage.viewport', 'desktop', false)

  groot.layout.design('visible', 'secondarySidebar', true);
  groot.layout.design('visible', 'panel', false);


  const { registerCommand } = grootCommandManager();
  registerCommand('gc.stage.refresh', (_, callback) => {
    commandBridge.stageRefresh(callback)
  })
}


export const getComponentVersionId = () => {
  const component = grootStateManager().getState('gs.studio.component');

  let componentVersionId;
  if (isPrototypeMode()) {
    componentVersionId = component.componentVersion.id;
  } else {
    const componentInstance = grootStateManager().getState('gs.studio.componentInstance');
    componentVersionId = componentInstance.componentVersion.id;
  }

  return componentVersionId;
}