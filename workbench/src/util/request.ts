import axios from 'axios';
import { message } from 'antd';
import { APIStore, requestFactory } from '@grootio/common';

import { authTokenKey, serverPath, successCode } from 'config';
import { LocalAPIStore } from 'api/API.store';

const request = requestFactory<APIStore & LocalAPIStore>({
  authTokenKey,
  serverPath,
  successCode,
  axiosInstance: axios.create(),
  alertError: (content: string) => {
    message.error(content);
  }
});

export default request;
