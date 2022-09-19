import type { APIPath } from './API.path';

// key APIPath枚举值: value [请求参数类型 , 返回数据类型]
export type APIStore = {
  [APIPath.currentAccount]: [null, API.Response<API.Account>];
  [APIPath.logout]: [];
  [APIPath.systemDict]: [null, API.Response<Record<string, APIPath.systemDict[]>>];

  [APIPath.applicationDetail]: [{ applicationId: number, releaseId?: number }, API.Response<Application>]
};
