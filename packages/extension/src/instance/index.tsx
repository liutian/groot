import { AppstoreOutlined } from "@ant-design/icons";
import { APIPath, ComponentInstance, PropBlockStructType, PropGroup } from "@grootio/common";
import { metadataFactory, propTreeFactory } from "@grootio/core";
import { getContext, grootCommandManager, grootHookManager, grootStateManager } from "context";
import ViewsContainer from "core/ViewsContainer";
import { PropSetter } from "share/PropSetter";
import { WorkArea } from "share/WorkArea";
import { parseOptions } from "util/utils";
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
  registerState('gs.studio.breadcrumbList', [], true)
  registerState('gs.studio.release', null, false)


  groot.layout.design('visible', 'secondarySidebar', true);
  groot.layout.design('visible', 'panel', false);

  registerCommand('gc.fetch.instance', (_, rootInstanceId) => {
    fetchRootInstance(rootInstanceId);
  });

  registerCommand('gc.studio.switchIstance', (_, instanceId) => {
    switchComponentInstance(instanceId)
  })


  registerCommand('gc.workbench.makeDataToStage', (_, refreshId) => {
    const list = getState('gs.studio.allComponentInstance')
    if (refreshId === 'all' || refreshId === 'first') {
      const metadataList = instanceToMetadata(list);
      callHook('gh.studio.prop.change', metadataList, refreshId === 'first')
      return;
    }

    let instanceId = refreshId;
    if (refreshId === 'current') {
      instanceId = getState('gs.studio.componentInstance').id;
    }

    const refreshInstance = list.find(i => i.id === instanceId);
    const [refreshMetadata] = instanceToMetadata([refreshInstance]);
    callHook('gh.studio.prop.change', refreshMetadata)
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

      itemList.forEach(item => {
        parseOptions(item);
        delete item.valueOptions
      })

      blockList.filter(block => block.struct === PropBlockStructType.List).forEach((block) => {
        block.listStructData = JSON.parse(block.listStructData as any || '[]');
      })

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
  request(APIPath.componentInstance_rootDetail_instanceId, { instanceId: rootInstanceId }).then(({ data: { children, root, release } }) => {

    const list = [root, ...children]
    // for (const { itemList, blockList } of list) {
    //   itemList.forEach(item => {
    //     parseOptions(item);
    //   })

    //   blockList.filter(block => block.struct === PropBlockStructType.List).forEach((block) => {
    //     block.listStructData = JSON.parse(block.listStructData as any || '[]');
    //   })
    // }

    grootStateManager().setState('gs.studio.release', release)
    grootStateManager().setState('gs.studio.allComponentInstance', list)

    grootCommandManager().executeCommand('gc.workbench.makeDataToStage', 'first');
    switchComponentInstance(root.id);
  });
}

export const switchComponentInstance = (instanceId: number) => {
  const list = grootStateManager().getState('gs.studio.allComponentInstance');
  const instance = list.find(item => item.id === instanceId);
  grootStateManager().setState('gs.studio.componentInstance', instance);
  grootStateManager().setState('gs.studio.component', instance.component);

  const breadcrumbList = grootStateManager().getState('gs.studio.breadcrumbList')
  breadcrumbList.length = 0;

  let ctxInstance = instance;
  do {
    breadcrumbList.push({ id: ctxInstance.id, name: ctxInstance.name });
    ctxInstance = list.find((item) => item.id === ctxInstance.parentId);
  } while (ctxInstance);
  breadcrumbList.reverse();
}
