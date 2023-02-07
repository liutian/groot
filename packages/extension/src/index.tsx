
import { GrootCommandType, GrootContext, MainType, ViewLoader } from '@grootio/common';

import './index.less'

export let groot: GrootContext;

const Main: MainType = ({ extPackageName, extPackageUrl, groot: _groot }) => {
  groot = _groot;

  groot.commandManager<GrootCommandType>().registerCommand('groot.command.workbench.render.activityBar', () => {
    return <ViewLoader packageName={extPackageName} module="ActivityBar" packageUrl={extPackageUrl} />
  });


  groot.onReady(() => {

  })

  return {

  };
}


export default Main;