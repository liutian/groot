export default class WorkbenchModel {
  public widgetWindowRect: 'min' | 'full' | 'normal' | 'none' | { x?: number, y?: number, width?: number, height?: number } = 'min';
  public sideWidth = 480;

  public project?: Project;
  public loadComponent: 'doing' | 'notfound' | 'over' = 'doing';
}