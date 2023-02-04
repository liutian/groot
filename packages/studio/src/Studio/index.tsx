import { StudioMode, StudioParams, useRegisterModel } from '@grootio/common';
import { useEffect } from 'react';
import StudioModel from './StudioModel';
import Workbench from './Workbench';

/**
 * 1.加载解决方案或者应用信息 
 * 2.加载插件
 * 3.启动工作台
 **/
const Studio: React.FC<StudioParams & { account: any }> = (params) => {
  const studioModel = useRegisterModel(StudioModel);

  useEffect(() => {
    studioModel.studioMode = params.studioMode;
    studioModel.account = params.account;
    if (params.studioMode == StudioMode.Prototype) {
      studioModel.fetchSolution(params.solutionId).then(() => {
        studioModel.initExtension().then(() => {
          // todo 研究promise自动刷新视图
          studioModel.loadStatus = 'ok';
        })
      })
    } else {
      studioModel.fetchApplication(params.appId, params.releaseId).then(() => {
        studioModel.initExtension().then(() => {
          // todo 研究promise自动刷新视图
          studioModel.loadStatus = 'ok';
        })
      })
    }
  }, []);

  if (studioModel.loadStatus === 'doing') {
    return <>load data ...</>
  } else if (studioModel.loadStatus === 'notfound') {
    return <>notfound component</>
  } else if (studioModel.loadStatus === 'fetch-extension') {
    return <>load extension ...</>
  } else {
    return <Workbench />
  }
}


export default Studio;
