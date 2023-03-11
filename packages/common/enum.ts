
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

export enum EnvTypeStr {
  Dev = 'dev',
  Qa = 'qa',
  Pl = 'pl',
  Ol = 'online'
}

export enum DeployStatusType {
  Approval = 1,
  Online = 2,
  Archive = 3
}


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

export enum StateCategory {
  Str = 1,
  Bool = 2,
  Num = 3,
  Obj = 4,
  Arr = 5
}

export enum StudioMode {
  Prototype = 'prototype',
  Instance = 'instance'
}

export enum ModalStatus {
  None = 'none',
  Init = 'init',
  Submit = 'submit'
}

export enum ViewportMode {
  PC = 'pc',
  H5 = 'h5'
}