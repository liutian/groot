
export enum ModalStatus {
  None = 'none',
  Init = 'init',
  Submit = 'submit'
}

export function needRewrite(): any {
  throw new Error('this function must be rewrite');
}

export enum WorkbenchEvent {
  DragComponentStart = 'drag_component_start',
  DragComponentEnd = 'drag_component_end',
}

export const RemotePluginKeySep = '!%!'