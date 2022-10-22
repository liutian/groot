
export enum ModalStatus {
  None = 'none',
  Init = 'init',
  Submit = 'submit'
}

export function needRewrite(): any {
  throw new Error('this function must be rewrite');
}

export enum WorkbenchEvent {
  AddChildComponent = 'add_child_component',
  CanvasHover = 'canvas_hover',
  CanvasSelect = 'canvas_select',
  CanvasMarkerReset = 'canvas_marker_reset'
}

export enum BreadcrumbChange {
  Append = 'append',
  Insert = 'insert',
  AppendRoot = 'append_root'
}