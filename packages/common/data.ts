
export enum PropMetadataType {
  Component = 'component',
  Json = 'json',
  Function = 'function'
}

export enum PostMessageType {

  InnerReady = 'inner_ready',
  OuterSetConfig = 'outer_set_config',
  InnerFetchApplication = 'inner_fetch_application',
  OuterSetApplication = 'outer_set_application',
  InnerApplicationnReady = 'inner_applicationn_ready',
  InnerFetchView = 'inner_fetch_view',
  OuterUpdateState = 'outer_update_state',
  OuterUpdateComponent = 'outer_update_component',
  OuterRefreshView = 'outer_refresh_view',

  OuterDragComponentOver = 'outer_drag_component_over',
  OuterDragComponentEnter = 'outer_drag_component_enter',
  OuterDragComponentLeave = 'outer_drag_component_leave',
  OuterDragComponentDrop = 'outer_drag_component_drop',
  InnerDragHitSlot = 'inner_drag_hit_slot',
  InnerDragLine = 'inner_drag_line',

  InnerOutlineHover = 'inner_outline_hover',
  InnerOutlineSelect = 'inner_outline_Select',
  InnerOutlineUpdate = 'inner_outline_update',
  OuterOutlineReset = 'outer_outline_reset',
  OuterComponentSelect = 'outer_component_select',
}


export enum PropItemType {
  Text = 1,
  Textarea = 2,
  Number = 3,
  Slider = 4,
  ButtonGroup = 5,
  Switch = 6,
  Select = 7,
  Radio = 8,
  Checkbox = 9,
  DatePicker = 10,
  TimePicker = 11,
  Hierarchy = 12,
  Flat = 13,
  Json = 14,
  Function = 15,
  Component = 16,
  Extension = 17
}

export enum PropBlockLayout {
  Horizontal = 1,
  Vertical = 2
}

export const PropBlockLayoutKeyMap = {
  [PropBlockLayout.Horizontal]: 'horizontal',
  [PropBlockLayout.Vertical]: 'vertical',
}

export enum PropGroupStructType {
  Flat = 1,
  Default = 2
}

export enum PropBlockStructType {
  List = 1,
  Default = 2
}

export enum PropValueType {
  Instance = 1,
  Prototype = 2,
}

export enum EnvType {
  Dev = 1,
  Qa = 2,
  Pl = 3,
  Ol = 4
}

export enum DeployStatusType {
  Approval = 1,
  Online = 2,
  Archive = 3
}

export const PropItemTypeNameMap = [
  { name: '文本', key: PropItemType.Text },
  { name: '多行文本', key: PropItemType.Textarea },
  { name: '数字', key: PropItemType.Number },
  { name: '滑块', key: PropItemType.Slider },
  { name: '按钮组', key: PropItemType.ButtonGroup },
  { name: '开关', key: PropItemType.Switch },
  { name: '下拉框', key: PropItemType.Select },
  { name: '多选', key: PropItemType.Checkbox },
  { name: '单选', key: PropItemType.Radio },
  { name: '日期', key: PropItemType.DatePicker },
  { name: '时间', key: PropItemType.TimePicker },
  { name: '配置项平铺', key: PropItemType.Flat },
  { name: '层级', key: PropItemType.Hierarchy },
  { name: 'json', key: PropItemType.Json },
  { name: '函数', key: PropItemType.Function },
  { name: '组件', key: PropItemType.Component },
];


export enum ComponentParserType {
  ReactComponent = 1,
  VueComponent = 2,
  Http = 3,
  DataSource = 4,
}

export enum ValueStruct {
  Common = 1,
  ChildComponentList = 2
}

export enum StateType {
  Str = 1,
  Bool = 2,
  Num = 3,
  Obj = 4,
  Arr = 5
}

export const StateTypeMap = [
  { name: '字符串', key: StateType.Str },
  { name: '数字', key: StateType.Num },
  { name: '布尔', key: StateType.Bool },
  { name: '对象', key: StateType.Obj },
  { name: '数组', key: StateType.Arr },
];