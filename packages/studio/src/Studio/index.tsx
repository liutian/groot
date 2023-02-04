import { GridLayout, StudioMode, StudioParams, useRegisterModel } from '@grootio/common';
import { useEffect, useState } from 'react';
import StudioModel from './StudioModel';
import Workbench from './Workbench';

/**
 * 1.加载解决方案或者应用信息 
 * 2.加载插件
 * 3.启动工作台
 * 4.启动插件入口
 **/
const Studio: React.FC<StudioParams & { account: any }> = (params) => {
  const studioModel = useRegisterModel(StudioModel);
  const [layout, setLayout] = useState<GridLayout>();

  useEffect(() => {
    studioModel.studioMode = params.studioMode;
    studioModel.account = params.account;
    let fetchPromise;
    if (params.studioMode == StudioMode.Prototype) {
      fetchPromise = studioModel.fetchSolution(params.solutionId)
    } else {
      fetchPromise = studioModel.fetchApplication(params.appId, params.releaseId)
    }

    fetchPromise.then(() => {
      studioModel.loadStatus = 'fetch-extension';
      // todo 研究promise自动刷新视图
      studioModel.fetchExtension().then((result) => {
        studioModel.loadStatus = 'ok';
        const layout = new GridLayout();
        setLayout(layout);
        studioModel.initExtension(result, layout)
      })
    })
  }, []);

  if (studioModel.loadStatus === 'doing') {
    return <>load data ...</>
  } else if (studioModel.loadStatus === 'notfound') {
    return <>notfound component</>
  } else if (studioModel.loadStatus === 'fetch-extension') {
    return <>load extension ...</>
  } else {
    return <Workbench layout={layout} />
  }
}


export default Studio;
