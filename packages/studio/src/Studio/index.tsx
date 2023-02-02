import { useRegisterModel } from '@grootio/common';
import { useEffect } from 'react';
import { StudioParams } from 'typings';
import StudioModel from './StudioModel';
import Workbench from './Workbench';

/**
 * 1.加载解决方案或者应用信息 
 * 2.加载插件
 * 3.启动工作台
 **/
const Studio: React.FC<StudioParams> = (params) => {
  const studioModel = useRegisterModel(StudioModel);

  useEffect(() => {
    studioModel.prototypeMode = params.prototypeMode;
    if (params.prototypeMode) {
      studioModel.fetchApplication(params.appId, params.releaseId).then(() => {
        studioModel.loadPlugin();
      })
    } else {
      studioModel.fetchSolution(params.solutionId).then(() => {
        studioModel.loadPlugin();
      })
    }
  }, []);

  if (studioModel.loadStatus === 'doing') {
    return <>load data ...</>
  } else if (studioModel.loadStatus === 'notfound') {
    return <>notfound component</>
  } else if (studioModel.loadStatus === 'fetch-plugin') {
    return <>load plugin ...</>
  } else {
    return <Workbench />
  }
}


export default Studio;
