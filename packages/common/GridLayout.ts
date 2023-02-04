
export type LayoutSetting = {
  primarySidebar: boolean,
  secondarySidebar: boolean,
  panel: boolean,

  activityBar: boolean,
  statusBar: boolean,
  toolBar: boolean,

  primaryLayout: 'left' | 'right',
  panelLayout: 'left' | 'right' | 'center' | 'stretch',
  toolBarLayout: 'left' | 'right' | 'center' | 'stretch'
}

export class GridLayout {
  public toolBarHeight = '40px'
  public panelHeight = '40px'
  public statusBarHeight = '30px'
  public activityBarWidth = '60px'
  public primarySidebarWidth = '250px'
  public secondarySidebarWidth = '250px'

  public styles = { gridTemplateColumns: '', gridTemplateRows: '', gridTemplateAreas: '' }
  public layoutSetting: LayoutSetting = {
    primarySidebar: true,
    secondarySidebar: false,
    panel: true,

    activityBar: true,
    statusBar: true,
    toolBar: true,

    primaryLayout: 'left',
    panelLayout: 'center',
    toolBarLayout: 'center'
  }
  private areasMap = new Map<string, string>([
    ['1*1', 'activityBar'], ['1*2', 'primarySidebar'], ['1*3', 'toolBar'], ['1*4', 'secondarySidebar'],
    ['2*1', 'activityBar'], ['2*2', 'primarySidebar'], ['2*3', 'editor'], ['2*4', 'secondarySidebar'],
    ['3*1', 'activityBar'], ['3*2', 'primarySidebar'], ['3*3', 'panel'], ['3*4', 'secondarySidebar'],
    ['4*1', 'statusBar'], ['4*2', 'statusBar'], ['4*3', 'statusBar'], ['4*4', 'statusBar'],
  ]);
  private rows = [this.toolBarHeight, '1fr', this.panelHeight, this.statusBarHeight];
  private columns = [this.activityBarWidth, this.primarySidebarWidth, '1fr', this.secondarySidebarWidth];

  constructor() {
    this.calcLayoutStyle();
  }

  public design = <
    T extends 'visible' | 'primary' | 'panel' | 'toolBar',
    V extends (T extends 'visible' ? ('primarySidebar' | 'secondarySidebar' | 'panel' | 'activityBar' | 'statusBar' | 'toolBar') : (T extends 'primary' ? 'left' | 'right' : 'left' | 'right' | 'center' | 'stretch')),
    O extends (T extends 'visible' ? boolean : null)>(type: T, value: V, other: O) => {
    if (type === 'visible') {
      this.layoutSetting[value as any] = other;
    } else {
      this.layoutSetting[type + 'Layout'] = value;
    }

    this.calcLayoutStyle();
  }

  private calcLayoutStyle() {
    if (this.layoutSetting.primaryLayout === 'left') {
      this.calcLayoutStyleLeft();
    } else {
      this.calcLayoutStyleRight();
    }

    if (this.layoutSetting.panel) {
      this.rows[2] = this.panelHeight;
    } else {
      this.rows[2] = '0'
    }

    if (this.layoutSetting.toolBar) {
      this.rows[0] = this.toolBarHeight;
    } else {
      this.rows[0] = '0'
    }

    if (this.layoutSetting.statusBar) {
      this.rows[3] = this.statusBarHeight;
    } else {
      this.rows[3] = '0'
    }

    let gridTemplateAreas = '';
    for (let row = 1; row < 5; row++) {
      gridTemplateAreas += ' " ';
      for (let col = 1; col < 5; col++) {
        const name = this.areasMap.get(`${row}*${col}`);
        gridTemplateAreas += ` ${name} `;
      }
      gridTemplateAreas += ' " \n';
    }

    this.styles = {
      gridTemplateColumns: this.columns.join(' '),
      gridTemplateRows: this.rows.join(' '),
      gridTemplateAreas
    }
  }

  private calcLayoutStyleLeft() {
    this.areasMap.set('2*1', 'activityBar');
    this.areasMap.set('2*2', 'primarySidebar');
    this.areasMap.set('2*3', 'editor');
    this.areasMap.set('2*4', 'secondarySidebar');

    if (this.layoutSetting.toolBarLayout === 'left') {
      this.areasMap.set('1*1', 'toolBar');
      this.areasMap.set('1*2', 'toolBar');
      this.areasMap.set('1*3', 'toolBar');
      this.areasMap.set('1*4', 'secondarySidebar');
    } else if (this.layoutSetting.toolBarLayout === 'right') {
      this.areasMap.set('1*1', 'activityBar');
      this.areasMap.set('1*2', 'primarySidebar');
      this.areasMap.set('1*3', 'toolBar');
      this.areasMap.set('1*4', 'toolBar');
    } else if (this.layoutSetting.toolBarLayout === 'center') {
      this.areasMap.set('1*1', 'activityBar');
      this.areasMap.set('1*2', 'primarySidebar');
      this.areasMap.set('1*3', 'toolBar');
      this.areasMap.set('1*4', 'secondarySidebar');
    } else if (this.layoutSetting.toolBarLayout === 'stretch') {
      this.areasMap.set('1*1', 'toolBar');
      this.areasMap.set('1*2', 'toolBar');
      this.areasMap.set('1*3', 'toolBar');
      this.areasMap.set('1*4', 'toolBar');
    }

    if (this.layoutSetting.panelLayout === 'left') {
      this.areasMap.set('3*1', 'panel');
      this.areasMap.set('3*2', 'panel');
      this.areasMap.set('3*3', 'panel');
      this.areasMap.set('3*4', 'secondarySidebar');
    } else if (this.layoutSetting.panelLayout === 'right') {
      this.areasMap.set('3*1', 'activityBar');
      this.areasMap.set('3*2', 'primarySidebar');
      this.areasMap.set('3*3', 'panel');
      this.areasMap.set('3*4', 'panel');
    } else if (this.layoutSetting.panelLayout === 'center') {
      this.areasMap.set('3*1', 'activityBar');
      this.areasMap.set('3*2', 'primarySidebar');
      this.areasMap.set('3*3', 'panel');
      this.areasMap.set('3*4', 'secondarySidebar');
    } else if (this.layoutSetting.panelLayout === 'stretch') {
      this.areasMap.set('3*1', 'panel');
      this.areasMap.set('3*2', 'panel');
      this.areasMap.set('3*3', 'panel');
      this.areasMap.set('3*4', 'panel');
    }

    if (this.layoutSetting.activityBar) {
      this.columns[0] = this.activityBarWidth
    } else {
      this.columns[0] = '0'
    }

    if (this.layoutSetting.primarySidebar) {
      this.columns[1] = this.primarySidebarWidth
    } else {
      this.columns[1] = '0'
    }

    this.columns[2] = '1fr';

    if (this.layoutSetting.secondarySidebar) {
      this.columns[3] = this.secondarySidebarWidth
    } else {
      this.columns[3] = '0'
    }
  }

  private calcLayoutStyleRight() {
    this.areasMap.set('2*1', 'secondarySidebar');
    this.areasMap.set('2*2', 'editor');
    this.areasMap.set('2*3', 'primarySidebar');
    this.areasMap.set('2*4', 'activityBar');

    if (this.layoutSetting.toolBarLayout === 'left') {
      this.areasMap.set('1*1', 'toolBar');
      this.areasMap.set('1*2', 'toolBar');
      this.areasMap.set('1*3', 'primarySidebar');
      this.areasMap.set('1*4', 'activityBar');
    } else if (this.layoutSetting.toolBarLayout === 'right') {
      this.areasMap.set('1*1', 'secondarySidebar');
      this.areasMap.set('1*2', 'toolBar');
      this.areasMap.set('1*3', 'toolBar');
      this.areasMap.set('1*4', 'toolBar');
    } else if (this.layoutSetting.toolBarLayout === 'center') {
      this.areasMap.set('1*1', 'secondarySidebar');
      this.areasMap.set('1*2', 'toolBar');
      this.areasMap.set('1*3', 'primarySidebar');
      this.areasMap.set('1*4', 'activityBar');
    } else if (this.layoutSetting.toolBarLayout === 'stretch') {
      this.areasMap.set('1*1', 'toolBar');
      this.areasMap.set('1*2', 'toolBar');
      this.areasMap.set('1*3', 'toolBar');
      this.areasMap.set('1*4', 'toolBar');
    }

    if (this.layoutSetting.panelLayout === 'left') {
      this.areasMap.set('3*1', 'panel');
      this.areasMap.set('3*2', 'panel');
      this.areasMap.set('3*3', 'primarySidebar');
      this.areasMap.set('3*4', 'activityBar');
    } else if (this.layoutSetting.panelLayout === 'right') {
      this.areasMap.set('3*1', 'secondarySidebar');
      this.areasMap.set('3*2', 'panel');
      this.areasMap.set('3*3', 'panel');
      this.areasMap.set('3*4', 'panel');
    } else if (this.layoutSetting.panelLayout === 'center') {
      this.areasMap.set('3*1', 'secondarySidebar');
      this.areasMap.set('3*2', 'panel');
      this.areasMap.set('3*3', 'primarySidebar');
      this.areasMap.set('3*4', 'activityBar');
    } else if (this.layoutSetting.panelLayout === 'stretch') {
      this.areasMap.set('3*1', 'panel');
      this.areasMap.set('3*2', 'panel');
      this.areasMap.set('3*3', 'panel');
      this.areasMap.set('3*4', 'panel');
    }

    if (this.layoutSetting.activityBar) {
      this.columns[3] = this.activityBarWidth
    } else {
      this.columns[3] = '0'
    }

    if (this.layoutSetting.primarySidebar) {
      this.columns[2] = this.primarySidebarWidth
    } else {
      this.columns[2] = '0'
    }

    this.columns[1] = '1fr'

    if (this.layoutSetting.secondarySidebar) {
      this.columns[0] = this.secondarySidebarWidth
    } else {
      this.columns[0] = '0'
    }
  }
}
