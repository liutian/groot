
import { MainType } from '@grootio/common';
import { CommandType } from 'type';

import './index.less'

const Main: MainType = ({ groot }) => {
  groot.commands.registerCommand<CommandType>('groot.hello', (text: string) => {
    console.log('groot core extension' + text);
  })

  groot.commands.executeCommand<CommandType>('groot.hello', 'qqq')

  setTimeout(() => {
    groot.layout.design('visible', 'primarySidebar', false)
  }, 3000)

  return {

  };
}


export default Main;