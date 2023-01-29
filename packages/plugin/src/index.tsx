import { MainType, PluginContext, State, StateType, WorkbenchEvent, WorkbenchModelType } from "@grootio/common";

let hostContext: PluginContext;

const Main: MainType = (context, config) => {
  if (context.workbenchModel.prototypeMode) {
    return config;
  }

  hostContext = context;
  context.workbenchModel.addEventListener(WorkbenchEvent.LaunchFinish, loadDataFinish);

  return {
    contributes: {
      // propSettingView: [{
      //   package: 'approve',
      //   title: '配置项',
      //   url: 'http://groot-local.com:12000/index.js',
      //   module: 'FormulaPropItem'
      // }],
      sidebarView: [{
        key: 'state-list',
        title: 'state列表',
        icon: 'CodeOutlined',
        view: {
          package: '_groot_core_plugin',
          title: 'state列表',
          url: 'http://groot-local.com:12000/index.js',
          module: 'StateList'
        }
      }]
    }
  }
}

function loadDataFinish(this: WorkbenchModelType) {
  const globalStateList = [
    {
      id: -1,
      name: '$env',
      value: this.application.release.name,
      type: StateType.Str,
      isRuntime: true
    }
  ] as State[];
  this.globalStateList.push(...globalStateList)
}

export { hostContext };

export default Main;