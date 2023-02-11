import { grootStateManager, isPrototypeMode } from "context";


export const switchComponentInstance = (instanceId: number) => {
  const list = grootStateManager().getState('gs.studio.allComponentInstance');
  const instance = list.find(item => item.id === instanceId);
  grootStateManager().setState('gs.studio.componentInstance', instance);
  grootStateManager().setState('gs.studio.component', instance.component);
}

export const getComponentVersionId = () => {
  const component = grootStateManager().getState('gs.studio.component');
  const componentInstance = grootStateManager().getState('gs.studio.componentInstance');

  let componentVersionId;
  if (isPrototypeMode()) {
    componentVersionId = component.componentVersion.id;
  } else {
    componentVersionId = componentInstance.componentVersion.id;
  }

  return componentVersionId;
}