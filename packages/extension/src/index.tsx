
import { ChromeOutlined, GithubOutlined } from '@ant-design/icons';
import { GrootCommandType, GrootContext, GrootStateType, MainType, ViewLoader } from '@grootio/common';
import PrimarySidebar from 'PrimarySidebar';
import Stage from 'Stage';
import ViewsContainer from 'ViewsContainer';

import './index.less'

export let groot: GrootContext;

const Main: MainType = ({ extPackageName, extPackageUrl, groot: _groot }) => {
  groot = _groot;

  const { registerCommand } = groot.commandManager<GrootCommandType>();
  const { registerState } = groot.stateManager<GrootStateType>();

  registerCommand('groot.command.workbench.render.toolBar', () => {
    return <></>
  });
  registerCommand('groot.command.workbench.render.activityBar', () => {
    return <ViewLoader packageName={extPackageName} module="ActivityBar" packageUrl={extPackageUrl} />
  });
  registerCommand('groot.command.workbench.render.primarySidebar', () => {
    return <PrimarySidebar />
  });
  registerCommand('groot.command.workbench.render.secondarySidebar', () => {
    return <></>
  });
  registerCommand('groot.command.workbench.render.stage', () => {
    return <Stage />
  });
  registerCommand('groot.command.workbench.render.panel', () => {
    return <></>
  });
  registerCommand('groot.command.workbench.render.statusBar', () => {
    return <></>
  });

  registerState('groot.state.ui.viewsContainers', [
    {
      id: 'explorer',
      name: '页面',
      icon: () => {
        return <GithubOutlined />
      },
      view: function () {
        return <ViewsContainer context={this} />
      },
      toolbar: null
    }, {
      id: 'chrome',
      name: '谷歌',
      icon: () => {
        return <ChromeOutlined />
      },
      view: function () {
        return <ViewsContainer context={this} />
      },
      toolbar: null
    }
  ])

  registerState('groot.state.ui.views', [
    {
      id: 'pages',
      name: '目录',
      icon: null,
      view: '目录',
      toolbar: null,
      parent: 'explorer'
    }, {
      id: 'plug',
      name: '插件',
      icon: null,
      view: '插件',
      toolbar: null,
      parent: 'chrome'
    }
  ])

  registerState('groot.state.workbench.activityBar.view', [
    'explorer', 'chrome'
  ])
  registerState('groot.state.workbench.activityBar.active', 'explorer')

  registerState('groot.state.workbench.primarySidebar.view', 'explorer')


  groot.onReady(() => {

  })

  return {

  };
}


export default Main;