export namespace API {
  // 当前用户信息
  export type Account = {
    name: string;
  };

  // 系统字典表枚举
  export type SystemDict = {
    value: number;
    label: string;
  };

  // 通用服务器响应类型
  export type Response<T> = {
    data: T;
    code: number;
    message: string;
  };

  // 查询类服务器响应
  export type QueryResponse<T> = {
    data: T[];
    total: number;
    code: number;
    message: string;
  };

  // 查询接口提交参数类型
  export type QueryParams<T> = {
    current?: number;
    pageSize?: number;
    keyword?: string;
    sorter?: Record<string, any>;
  } & T;

}
