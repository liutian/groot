import { commandBridge, grootCommandManager, grootStateManager, isPrototypeMode } from "context";


export const shareBootstrap = () => {
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