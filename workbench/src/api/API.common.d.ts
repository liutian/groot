declare namespace API {
  // 当前用户信息
  type Account = {
    name: string;
  };

  // 系统字典表枚举
  type SystemDict = {
    value: number;
    label: string;
  };

  // 通用服务器响应类型
  type Response<T> = {
    data: T;
    success: boolean;
    code: number;
    message: string;
  };

  // 查询类服务器响应
  type QueryResponse<T> = {
    data: T[];
    total: number;
    success: boolean;
    code: number;
    message: string;
  };

  // 查询接口提交参数类型
  type QueryParams<T> = {
    current?: number;
    pageSize?: number;
    keyword?: string;
    sorter?: Record<string, any>;
  } & T;

}
