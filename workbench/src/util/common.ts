
export enum ModalStatus {
  None = 'none',
  Init = 'init',
  Submit = 'submit'
}

export function needRewrite(): any {
  throw new Error('this function must be rewrite');
}

export enum WorkbenchEvent {
  AddComponent = 'add_component',
  CanvasHover = 'canvas_hover',
  CanvasSelect = 'canvas_select',
  CanvasMarkerReset = 'canvas_marker_reset'
}