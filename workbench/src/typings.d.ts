
declare module '*.less';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly APP: 'online' | 'pl' | 'qa' | 'dev';
  }
}

interface Window {
  define: (
    moduleName: string,
    depsKey: string[],
    wrapper: (...defaultModule: any) => void
  ) => void;
  _moduleCallback: (module: any) => void;
}

/**
 * 描述代码元数据配置的属性分组类型
 */
type PropGroup = {
  propBlockList: PropBlock[],
  templateBlock?: PropBlock,

  relativeItemId?: number,
  templateBlockId?: number,

  // 分割线下面时界面属性
  highlight?: boolean,
  expandBlockIdList: number[],
  templateBlockDesignMode?: boolean,
} & Omit<import("../../cloud/src/entities/PropGroup").PropGroup, 'propBlockList' | 'templateBlock'>;

/**
 * 描述代码元数据配置的属性配置块类型
 */
type PropBlock = {
  propItemList: PropItem[],
  layout: 'horizontal' | 'vertical'
  // 分割线下面时界面属性
  highlight?: boolean
} & Omit<import("../../cloud/src/entities/PropBlock").PropBlock, 'propItemList' | 'layout'>;

/**
 * 描述代码元数据配置的属性配置项类型
 */
type PropItem = {
  valueOfGroup?: PropGroup,
  templateBlock?: PropBlock,
  directBlock?: PropBlock,
  type: 'Text' | 'Textarea' | 'Date_Picker' | 'Time_Picker' | 'Switch' | 'Select' | 'Radio' | 'Checkbox' | 'List' | 'Item' | 'Hierarchy' | 'Json' | 'Function',

  groupId: number,
  valueOfGroupId?: number,

  // 分割线下面时界面属性
  highlight?: boolean,
  optionList: PropValueOption[],
} & Omit<import("../../cloud/src/entities/PropItem").PropItem, 'type' | 'valueOfGroup' | 'templateBlock' | 'directBlock'>;

type PropValueOption = {
  label: string,
  value: PropItemType
};

type ComponentVersion = {
  groupList: PropGroup[],
  blockList: PropBlock[],
  itemList: PropItem[],
} & Omit<import("../../cloud/src/entities/ComponentVersion").ComponentVersion, 'groupList' | 'blockList' | 'itemList'>;

type ComponentInstance = {

} & Omit<import("../../cloud/src/entities/ComponentInstance").ComponentInstance, ''>;

type Release = {
  instanceList: ComponentInstance[]
} & Omit<import("../../cloud/src/entities/Release").Release, ''>;

type PropValue = {

} & Omit<import("../../cloud/src/entities/PropValue").PropValue, ''>;

type Component = {
  version: ComponentVersion,
  recentVersionId: number

  versionList: ComponentVersion[]
} & Omit<import("../../cloud/src/entities/Component").Component, 'version'>;

type Application = {

  release: Release
} & Omit<import("../../cloud/src/entities/Application").Application, ''>;

type Scaffold = {

  componentList: Component[]
} & Omit<import("../../cloud/src/entities/Scaffold").Scaffold, ''>;

type CodeMeta = {
  id: number,
  key: string,
  defaultValue: any,
  type: PropItemType
}

type PropItemType = import("../../cloud/src/entities/PropItem").PropItemType;

