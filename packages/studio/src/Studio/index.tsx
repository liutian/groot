import { APIPath, GridLayout, StudioMode, StudioParams } from '@grootio/common';
import { message } from 'antd';
import { localExtension } from 'config';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import request from 'util/request';
import { execExtension, loadExtension } from './groot';
import Workbench from './Workbench';

/**
 * 1.加载解决方案或者应用信息 
 * 2.加载插件
 * 3.启动工作台
 * 4.启动插件入口
 **/
const Studio: React.FC<StudioParams & { account: any }> & { Wrapper: React.FC<{ account: any }> } = (params) => {
  const [loadStatus, setLoadStatus] = useState<'doing' | 'no-application' | 'no-solution' | 'no-instance' | 'fetch-extension' | 'notfound' | 'ok'>('doing');
  const [layout, setLayout] = useState<GridLayout>();

  useEffect(() => {
    let fetchDataPromise;
    if (params.studioMode == StudioMode.Prototype) {
      fetchDataPromise = fetchSolution(params.solutionId)
    } else {
      fetchDataPromise = fetchApplication(params.appId, params.releaseId)
    }

    fetchDataPromise.then((data) => {
      setLoadStatus('fetch-extension');
      // todo 研究promise自动刷新视图
      fetchExtension(data).then((remoteExtensionList) => {
        setLoadStatus('ok');
        const layout = new GridLayout();
        setLayout(layout);

        execExtension(remoteExtensionList, {
          mode: params.studioMode,
          application: params.studioMode === StudioMode.Instance ? data : null,
          solution: params.studioMode === StudioMode.Prototype ? data : null,
          account: params.account,
          releaseId: params.releaseId,
          instanceId: params.instanceId,
          componentId: params.componentId
        }, layout)
      })
    })
  }, []);

  const fetchSolution = (solutionId: number) => {
    return request(APIPath.solution_detail_solutionId, { solutionId }).then(({ data }) => {
      return data;
    }).catch((e) => {
      setLoadStatus('no-solution');
      return Promise.reject(e);
    })
  }

  const fetchApplication = (applicationId: number, releaseId?: number) => {
    return request(APIPath.application_detail_applicationId, { applicationId, releaseId }).then(({ data }) => {
      return data;
    }).catch((e) => {
      setLoadStatus('no-application');
      return Promise.reject(e);
    })
  }

  const fetchExtension = (data) => {
    const localCustomExtension = localStorage.getItem(localExtension);

    if (localCustomExtension) {
      let remoteExtensionList = localCustomExtension.split(',').map(str => {
        const [prefix, packageUrl] = str.split('@');
        const [name, packageName = name] = prefix.split('#');
        return { packageName, packageUrl, main: null, config: null, name }
      });
      return loadExtension(remoteExtensionList)
    } else {
      return loadExtension(data.extensionList)
    }
  }

  if (loadStatus === 'doing') {
    return <>load data ...</>
  } else if (loadStatus === 'notfound') {
    return <>notfound component</>
  } else if (loadStatus === 'fetch-extension') {
    return <>load extension ...</>
  } else {
    return <Workbench layout={layout} />
  }
}

Studio.Wrapper = (account) => {
  const [searchParams] = useSearchParams();

  const [params] = useState(() => {
    const studioMode = searchParams.get('studioMode') as StudioMode || StudioMode.Instance;
    const solutionId = +searchParams.get('solutionId')
    const appId = +searchParams.get('appId')
    const componentId = +searchParams.get('componentId')
    const instanceId = +searchParams.get('instanceId')
    const releaseId = +searchParams.get('releaseId')

    if (studioMode === StudioMode.Instance) {
      if (!appId) {
        setTimeout(() => {
          message.warning('参数appId为空');
        })
        return null;
      }
    } else if (studioMode === StudioMode.Prototype) {
      if (!solutionId) {
        setTimeout(() => {
          message.warning('参数solutionId为空');
        })
        return null;
      }
    }
    return {
      solutionId,
      appId,
      instanceId,
      releaseId,
      componentId,
      studioMode
    }
  })

  return <Studio {...params} account={account} />
}

export default Studio;
