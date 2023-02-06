import { APIPath, GridLayout, StudioMode, StudioParams } from '@grootio/common';
import { localExtension } from 'config';
import { useEffect, useState } from 'react';
import request from 'util/request';
import { execExtension, loadExtension } from './groot';
import Workbench from './Workbench';

/**
 * 1.加载解决方案或者应用信息 
 * 2.加载插件
 * 3.启动工作台
 * 4.启动插件入口
 **/
const Studio: React.FC<StudioParams & { account: any }> = (params) => {
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
        const [packageName, packageUrl] = str.split('@')
        return { packageName, packageUrl, main: null, config: null }
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


export default Studio;
