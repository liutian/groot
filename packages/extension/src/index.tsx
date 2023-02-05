
import { GrootCommandType, MainType, ViewLoader } from '@grootio/common';
import { CommandType, StateType } from 'type';

import './index.less'

const Main: MainType = ({ extName, extUrl, groot }) => {
  groot.commands.registerCommand<CommandType>('groot.hello', (text: string) => {
    console.log('groot core extension' + text);
  })

  groot.commands.executeCommand<CommandType>('groot.hello', 'qqq')

  // groot.layout.design('visible', 'primarySidebar', false)
  // groot.layout.design('visible', 'activityBar', false)

  groot.states.registerState<StateType>('groot.instance');

  setTimeout(() => {
    groot.states.setState<StateType>('groot.instance', { id: 2323 } as any)
  }, 3000);
  setTimeout(() => {
    const instance = groot.states.getState<StateType>('groot.instance');
    // alert(instance.id)
  }, 6000)

  groot.commands.registerCommand<GrootCommandType>('groot.workbench.render.activityBar', () => {
    return <ViewLoader packageName={extName} module="ActivityBar" url={extUrl} />
  });

  groot.onReady(() => {

  })

  return {

  };
}


export default Main;