import { AppstoreOutlined } from "@ant-design/icons";
import { APIPath, PropGroup } from "@grootio/common";
import { metadataFactory, propTreeFactory } from "@grootio/core";
import { getContext, grootCommandManager, grootHookManager, grootStateManager } from "context";
import ViewsContainer from "core/ViewsContainer";
import { PropSetter } from "share/PropSetter";
import { WorkArea } from "share/WorkArea";
import { Solution } from "./Solution";

export const prototypeBootstrap = () => {
  const { groot } = getContext();
  const { registerState } = grootStateManager();
  const { registerCommand, executeCommand } = grootCommandManager();

  registerState('gs.ui.viewsContainers', [
    {
      id: 'solution',
      name: '组件',
      icon: () => {
        return <AppstoreOutlined />
      },
      view: function () {
        return <ViewsContainer context={this} />
      },
    }, {
      id: 'propSetter',
      name: '属性设置器',
      view: function () {
        return <ViewsContainer context={this} />
      }
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
      id: 'solutio',
      name: '组件',
      view: <Solution />,
      parent: 'solution'
    }, {
      id: 'propSetter',
      name: '属性设置器',
      view: <PropSetter />,
      parent: 'propSetter'
    }, {
      id: 'workArea',
      name: '工作区',
      view: <WorkArea />,
      parent: 'workArea'
    }
  ], true)


  registerState('gs.workbench.activityBar.viewsContainers', ['solution'], true)
  registerState('gs.workbench.activityBar.active', 'solution', false);
  registerState('gs.workbench.primarySidebar.viewsContainer', 'solution', false);
  registerState('gs.workbench.secondarySidebar.viewsContainer', 'propSetter', false);
  registerState('gs.workbench.stage.view', 'workArea', false);
  registerState('gs.studio.component', null, false)

  groot.layout.design('visible', 'secondarySidebar', true);
  groot.layout.design('visible', 'panel', false);

  registerCommand('gc.fetch.prototype', (_, componentId, versionId) => {
    fetchComponent(componentId, versionId);
  })

  registerCommand('gc.workbench.makeDataToStage', (_) => {
    syncDataToStage();
  })

  groot.onReady(() => {
    executeCommand('gc.fetch.prototype', groot.params.componentId, groot.params.versionId)
  })
}

const fetchComponent = (componentId: number, versionId: number) => {
  const { request } = getContext();
  request(APIPath.componentPrototype_detail_componentId, { componentId, versionId }).then(({ data }) => {
    grootStateManager().setState('gs.studio.component', data)
    grootCommandManager().executeCommand('gc.workbench.makeDataToStage', 'all')
  })
}

const syncDataToStage = () => {
  const component = grootStateManager().getState('gs.studio.component');

  if (!component.propTree) {
    const { groupList, blockList, itemList, valueList } = component;
    const propTree = propTreeFactory(groupList, blockList, itemList, valueList) as any as PropGroup[];
    groupList.forEach((group) => {
      if (!Array.isArray(group.expandBlockIdList)) {
        group.expandBlockIdList = group.propBlockList.map(block => block.id);
      }
    })
    component.propTree = propTree;
  }

  const metadata = metadataFactory(component.propTree, component, component.id, null);
  grootHookManager().callHook('gh.stage.syncData', metadata)
}