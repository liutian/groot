import { AppstoreOutlined } from "@ant-design/icons";
import { APIPath, ComponentInstance, PropGroup } from "@grootio/common";
import { metadataFactory, propTreeFactory } from "@grootio/core";
import { getContext, grootCommandManager, grootHookManager, grootStateManager } from "context";
import ViewsContainer from "core/ViewsContainer";
import { switchComponentInstance } from "share";
import { PropSetter } from "share/PropSetter";
import { WorkArea } from "share/WorkArea";
import { Application } from "./Application";
import { Material } from "./Material";


export const instanceBootstrap = () => {
  const { groot } = getContext();
  const { registerState, getState } = grootStateManager();
  const { registerCommand, executeCommand } = grootCommandManager();
  const { callHook } = grootHookManager();

  registerState('gs.ui.viewsContainers', [
    {
      id: 'application',
      name: '页面',
      icon: () => {
        return <AppstoreOutlined />
      },
      view: function () {
        return <ViewsContainer context={this} />
      },
    }, {
      id: 'material',
      name: '物料',
      icon: () => {
        return <AppstoreOutlined />
      },
      view: function () {
        return <ViewsContainer context={this} />
      },
    }, {
      id: 'custom_icon',
      name: '物料',
      icon: () => {
        return <span onClick={(e) => {
          alert('haha')
          e.stopPropagation();
        }}>
          <AppstoreOutlined />
        </span>
      }
    }, {
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
      id: 'application',
      name: '页面',
      view: <Application />,
      parent: 'application'
    }, {
      id: 'material',
      name: '物料',
      view: <Material />,
      parent: 'material'
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

  registerState('gs.workbench.activityBar.viewsContainers', ['application', 'material', 'custom_icon'], true)
  registerState('gs.workbench.activityBar.active', 'application', false);
  registerState('gs.workbench.primarySidebar.viewsContainer', 'application', false);
  registerState('gs.workbench.secondarySidebar.viewsContainer', 'propSetter', false);
  registerState('gs.workbench.stage.view', 'workArea', false);


  registerState('gs.studio.componentInstance', null, false)
  registerState('gs.studio.component', null, false)
  registerState('gs.studio.allComponentInstance', [], true)


  groot.layout.design('visible', 'secondarySidebar', true);
  groot.layout.design('visible', 'panel', false);

  registerCommand('gc.fetch.instance', (_, rootInstanceId) => {
    fetchRootInstance(rootInstanceId);
  });


  registerCommand('gc.workbench.makeDataToStage', (_, refreshId) => {
    const list = getState('gs.studio.allComponentInstance')
    if (refreshId === 'all') {
      const metadataList = instanceToMetadata(list);
      callHook('gh.stage.syncData', metadataList)
      return;
    }

    let instanceId = refreshId;
    if (refreshId === 'current') {
      instanceId = getState('gs.studio.componentInstance').id;
    }

    const refreshInstance = list.find(i => i.id === instanceId);
    const [refreshMetadata] = instanceToMetadata([refreshInstance]);
    callHook('gh.stage.syncData', refreshMetadata)
  })

  groot.onReady(() => {
    executeCommand('gc.fetch.instance', groot.params.instanceId)
  })
}


const instanceToMetadata = (instanceList: ComponentInstance[]) => {
  return instanceList.map((instance) => {
    const { groupList, blockList, itemList } = instance;
    const valueList = instance.valueList;
    if (!instance.propTree) {
      instance.propTree = propTreeFactory(groupList, blockList, itemList, valueList) as PropGroup[];
      groupList.forEach((group) => {
        if (!Array.isArray(group.expandBlockIdList)) {
          group.expandBlockIdList = group.propBlockList.map(block => block.id);
        }
      })
    }
    const metadata = metadataFactory(instance.propTree, instance.component, instance.id, instance.rootId, instance.parentId);
    return metadata;
  })
}

const fetchRootInstance = (rootInstanceId: number) => {
  const { request } = getContext();
  request(APIPath.componentInstance_rootDetail_instanceId, { instanceId: rootInstanceId }).then(({ data: { children, root } }) => {

    grootStateManager().setState('gs.studio.allComponentInstance', [root, ...children])

    grootCommandManager().executeCommand('gc.workbench.makeDataToStage', 'all');
    switchComponentInstance(root.id);
  });
}
