
export enum ModalStatus {
  None = 'none',
  Init = 'init',
  Submit = 'submit'
}

export function needRewrite(): any {
  throw new Error('this function must be rewrite');
}

export enum WorkbenchEvent {
  CanvasMarkerReset = 'canvas_marker_reset',
  DragStart = 'drag_start'
}

export enum ViewportMode {
  PC = 'pc',
  H5 = 'h5'
}
