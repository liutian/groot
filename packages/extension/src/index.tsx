
import { GrootCommandType, MainType, ViewLoader } from '@grootio/common';

import './index.less'

const Main: MainType = ({ extPackageName, extPackageUrl, groot }) => {

  groot.commands.registerCommand<GrootCommandType>('groot.command.workbench.render.activityBar', () => {
    return <ViewLoader packageName={extPackageName} module="ActivityBar" packageUrl={extPackageUrl} />
  });

  groot.onReady(() => {

  })

  return {

  };
}


export default Main;