/**
 * 组件元数据
 * 用来描述生成的代码片段
 */
export type CodeMetadata = {
  /**
   * 元数据生成代码时的模块名
   */
  moduleName: string;
  /**
   * 依赖模块所属包
   */
  packageName: string;
  /**
   * 依赖的模块名称
   */
  componentName: string;
  /**
   * 代码片段类型
   * page: 页面组件代码
   * component: 页面局部UI组件代码，例如模态层组件
   */
  type: 'page' | 'component';
  /**
   * 组件属性配置
   */
  props?: PropType[]

  /**
   * 行为描述
   */
  actions?: [
    {
      key: string,
      type: 'request',
      target: string
    }
  ];
  /**
   * 涉及的请求
   */
  requests?: [
    {
      key: string,
      url: string,
      query: { [key: string]: string },
      params: any,
      method: 'get' | 'post'
    }
  ];
};

export type BaseValueType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function';

/**
 * 属性元数据
 */
export type PropType = {
  /**
   * 属性名
   */
  key: string,
  /**
   * 属性类型
   */
  valueType: BaseValueType,
  /**
   * 默认值
   */
  defaultValue: any,
  /**
   * 属性值关联状态
   */
  statRelative: boolean
}

/**
 * 组件UI状态元数据
 */
export type StatType = {
  key: string,
  defaultValue: any,
  valueType: BaseValueType
}

