import { commandBridge, getContext, grootManager, isPrototypeMode } from "context";
import ViewsContainer from "core/ViewsContainer";
import { PropSetter } from "./PropSetter";
import ToolBar from "./ToolBar";
import { WorkArea } from "./WorkArea";
import FormRender from './FormRender'


export const shareBootstrap = () => {
  const { groot } = getContext();
  const { registerState } = grootManager.state


  registerState('gs.ui.viewsContainers', [
    {
      id: 'propSetter',
      name: '属性设置器',
      view: function () {
        return <ViewsContainer context={this} />
      },
    }, {
      id: 'workArea',
      name: '工作区',
      view: function () {
        return <ViewsContainer context={this} />
      }
    }
  ], true)

  registerState('gs.ui.views', [
    {
      id: 'propSetter',
      name: '属性设置器',
      view: <PropSetter />,
      parent: 'propSetter'
    }, {
      id: 'workArea',
      name: '工作区',
      view: <WorkArea />,
      parent: 'workArea'
    }, {
      id: 'toolBar',
      name: '工具栏',
      view: <ToolBar />,
    }
  ], true)

  registerState('gs.ui.secondarySidebar.active', 'propSetter', false);
  registerState('gs.ui.stage.active', 'workArea', false);
  registerState('gs.ui.banner.views', [
    { id: 'toolBar', placement: 'center' }
  ], true)
  registerState('gs.ui.stageViewport', 'desktop', false)

  registerState('gs.stage.debugBaseUrl', '', false)
  registerState('gs.stage.playgroundPath', '', false)


  registerState('gs.propItem.formRenderList', [{ viewType: '*', render: FormRender }], true)
  registerState('gs.propItem.viewTypeList', [
    { label: '文本', value: 'text' },
    { label: '多行文本', value: 'textarea' },
    { label: '数字', value: 'number' },
    { label: '滑块', value: 'slider' },
    { label: '按钮组', value: 'buttonGroup' },
    { label: '开关', value: 'switch' },
    { label: '下拉框', value: 'select' },
    { label: '多选', value: 'checkbox' },
    { label: '单选', value: 'radio' },
    { label: '日期', value: 'datePicker' },
    { label: '时间', value: 'timePicker' },
    { label: 'json', value: 'json' },
    { label: '函数', value: 'function' },
    { label: '组件', value: 'component' },
  ], true)



  groot.layout.design('visible', 'secondarySidebar', true);
  groot.layout.design('visible', 'panel', false);
  groot.layout.design('banner', 'center', null)

  grootManager.command.registerCommand('gc.stageRefresh', (_, callback) => {
    commandBridge.stageRefresh(callback)
  })

  grootManager.command.registerCommand('gc.pushPropItemToStack', (_, propItem) => {
    commandBridge.pushPropItemToStack(propItem)
  })
}


export const getComponentVersionId = () => {
  const component = grootManager.state.getState('gs.component');

  let componentVersionId;
  if (isPrototypeMode()) {
    componentVersionId = component.componentVersion.id;
  } else {
    const componentInstance = grootManager.state.getState('gs.componentInstance');
    componentVersionId = componentInstance.componentVersion.id;
  }

  return componentVersionId;
}