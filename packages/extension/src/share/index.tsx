import { grootStateManager, isPrototypeMode } from "context";



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