import { RequestFnType } from './internal';

export const requestFactory = <T extends Record<string, any[]>>(config: ConfigType) => {
  axiosWrapper(config);

  /**
   * 该方法主要功能是转换接口入参和返回值结构，目的是更好和不同项目进行适配，少一些数据转换的代码
   * 不同的项目，该文件适配逻辑可能不同
   * @param path 接口地址
   * @param data 接口传参
   * @param config axios其他配置项
   * @returns
   */
  const request: RequestFnType<T> & { clone: CloneType<T> } = (path, data?, axiosConfig?) => {
    let [method, url] = path.trim().split(/\s+/gim);
    // 默认get请求不需要加method
    if (!url) {
      url = method;
      method = 'get';
    }

    const dataObj: any = {};
    if (data) {
      if (['PUT', 'POST', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
        dataObj.data = data;
      } else {
        dataObj.params = data;
      }
    }

    return config.axiosInstance(url, { method, ...dataObj, axiosConfig });
  }

  request.clone = function (logger?: (type: 'request' | 'response', ...args: any[]) => void) {
    return (path, data, { _noMessage }: { _noMessage: boolean }) => {
      return request(path, data, {
        _noMessage,
        transformRequest: [(data, headers) => {
          logger && logger('request', path, headers)
          return data;
        }],
        transformResponse: [(data) => {
          logger && logger('response', data);
          return data;
        }]
      });
    };
  } as () => RequestFnType<T>;

  return request;
}

function axiosWrapper(config: ConfigType) {
  config.axiosInstance.defaults.timeout = 60000;
  // request拦截器
  config.axiosInstance.interceptors.request.use(
    (axiosConfig) => {
      const newConfig = { ...axiosConfig };

      // 自动添加token
      if (config.authTokenKey) {
        const autoToken = window.localStorage.getItem(config.authTokenKey);
        if (autoToken) {
          newConfig.headers[config.authTokenKey] = autoToken;
        }
      }

      const newData = { ...(newConfig.params || newConfig.data || {}) };

      // 自动添加URL前缀
      if (newConfig.url) {
        if (!newConfig.url.startsWith('/') && !newConfig.url.startsWith('http')) {
          newConfig.url = `${config.serverPath}/${newConfig.url}`;
        }

        const newUrl = new URL(newConfig.url);
        // 替换Url中的占位符，例如：
        // path: /api/user/list/:typeCode  data: {typeCode: 'xyz', name: 'aaa'}
        // 转换
        // path: /api/user/list/axy  data: {name: 'aaa'}
        // ** 尽量不要使用url参数占位符
        const [pathname, search] = [newUrl.pathname, newUrl.search].map(str => {
          return str.replace(/:[^/?&#]+/img, (matchStr) => {
            const key = matchStr.substr(1);

            if (newData.hasOwnProperty(key)) {
              const newKey = newData[key];
              delete newData[key];
              return newKey || '';
            }

            throw new Error(`not match url placeholder : ${newConfig.url}`);
          });
        });

        newUrl.pathname = pathname;
        newUrl.search = search;
        newConfig.url = newUrl.toString();
      }

      Object.keys(newData).forEach(key => {
        if (newData[key] === null || newData[key] === undefined) {
          delete newData[key];
        }
      })

      if (newConfig.params) {
        newConfig.params = newData;
      } else if (newConfig.data) {
        newConfig.data = newData;
      }

      return newConfig;
    },
    (error) => {
      config.alertError('请求失败');

      return Promise.reject(error);
    },
  );

  // response 拦截器
  config.axiosInstance.interceptors.response.use(
    (response) => {
      // 接口返回二进制流时，直接返回response
      if (response.config.responseType === 'blob') return response;
      // 如果data不是对象，返回失败
      if (!(response.data instanceof Object)) {
        config.alertError('服务异常');
        return Promise.reject(response);
      }

      const res = response.data;
      const resCode = res.code;

      // 因为大部分情况业务开发不关心接口header config，所以业务处理成功时，直接返回 data，
      if (resCode === config.successCode) {
        return response.data;
      }

      // 登录状态过期时的逻辑
      if (resCode === 401) {
        if (config.authTokenKey) {
          localStorage.removeItem(config.authTokenKey);
        }

        if (config.reLogin) {
          return config.reLogin()
        } else {
          return Promise.reject(response);
        }
      }

      // 如果 config._noMessage = true 则禁止弹出接口异常消息框
      /* eslint-disable no-underscore-dangle */
      if ((response.config as any)._noMessage !== true) {
        // 其它业务code的逻辑
        config.alertError(res.message);
      }

      return Promise.reject(response);
    },
    (error) => {
      // Network Error的提示
      if (error.message === 'Network Error') {
        config.alertError('网络异常');

        return Promise.reject(error);
      }

      // 请求超时的提示
      if (error.code === 'ECONNABORTED') {
        config.alertError('请求超时');

        return Promise.reject(error);
      }

      // 其它状态码的错误提示
      if (error.response) {
        config.alertError(`请求错误: ${error.response.status} - ${codeMessage[error.response.status]}`);
      }

      return Promise.reject(error);
    },
  );
}

// 状态信息
const codeMessage = {
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '接口不存在',
  405: '请求方法不被允许。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

type ConfigType = {
  axiosInstance: any,
  authTokenKey?: string,
  serverPath: string,
  successCode: number,
  alertError: (content: string) => void,
  reLogin?: () => Promise<any>
}

type CloneType<T extends Record<string, any[]>> = (logger?: (type: 'request' | 'response', ...args: any[]) => void) => RequestFnType<T>;