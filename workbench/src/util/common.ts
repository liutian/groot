
export enum ModalStatus {
  None = 'none',
  Init = 'init',
  Submit = 'submit'
}

export function needRewrite(): any {
  throw new Error('this function must be rewrite');
}

export enum WorkbenchEvent {
  DragStart = 'drag_start',
  DragEnd = 'drag_end',
}

export const RemotePluginKeySep = '!%!'