
import { GrootCommandType, MainType, ViewLoader } from '@grootio/common';
import { CommandType, StateType } from 'type';

import './index.less'

const Main: MainType = ({ extName, extUrl, groot }) => {

  groot.commands.registerCommand<GrootCommandType>('groot.workbench.render.activityBar', () => {
    return <ViewLoader packageName={extName} module="ActivityBar" url={extUrl} />
  });

  groot.onReady(() => {

  })

  return {

  };
}


export default Main;