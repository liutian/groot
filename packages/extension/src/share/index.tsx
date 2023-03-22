import { commandBridge, getContext, grootManager, isPrototypeMode } from "context";
import ViewsContainer from "core/ViewsContainer";
import { PropSetter } from "./PropSetter";
import ToolBar from "./ToolBar";
import { WorkArea } from "./WorkArea";


export const shareBootstrap = () => {
  const { groot } = getContext();
  const { registerState } = grootManager.state


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

  registerState('gs.ui.secondarySidebar.active', 'propSetter', false);
  registerState('gs.ui.stage.active', 'workArea', false);
  registerState('gs.ui.banner.views', [
    { id: 'toolBar', placement: 'center' }
  ], true)
  registerState('gs.ui.stageViewport', 'desktop', false)

  registerState('gs.stage.debugBaseUrl', '', false)
  registerState('gs.stage.playgroundPath', '', false)

  groot.layout.design('visible', 'secondarySidebar', true);
  groot.layout.design('visible', 'panel', false);
  groot.layout.design('banner', 'center', null)

  grootManager.command.registerCommand('gc.stageRefresh', (_, callback) => {
    commandBridge.stageRefresh(callback)
  })
}


export const getComponentVersionId = () => {
  const component = grootManager.state.getState('gs.component');

  let componentVersionId;
  if (isPrototypeMode()) {
    componentVersionId = component.componentVersion.id;
  } else {
    const componentInstance = grootManager.state.getState('gs.componentInstance');
    componentVersionId = componentInstance.componentVersion.id;
  }

  return componentVersionId;
}