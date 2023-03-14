import { AppstoreOutlined } from "@ant-design/icons";
import { APIPath, ComponentInstance, PropBlockStructType, PropGroup } from "@grootio/common";
import { metadataFactory, propTreeFactory } from "@grootio/core";
import { getContext, grootCommandManager, grootHookManager, grootStateManager } from "context";
import ViewsContainer from "core/ViewsContainer";
import { parseOptions } from "util/utils";
import { Application } from "./Application";
import { Material } from "./Material";


export const instanceBootstrap = () => {
  const { groot } = getContext();
  const { registerState, getState } = grootStateManager();
  const { registerCommand, executeCommand } = grootCommandManager();
  const { callHook } = grootHookManager();

  getState('gs.ui.viewsContainers').push(...[
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
    },
  ])

  getState('gs.ui.views').push(...[
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
    },
  ])


  registerState('gs.ui.activityBar.viewsContainers', ['application', 'material', 'custom_icon'], true)
  registerState('gs.ui.activityBar.active', 'application', false);
  registerState('gs.ui.primarySidebar.active', 'application', false);


  registerState('gs.componentInstance', null, false)
  registerState('gs.component', null, false)
  registerState('gs.allComponentInstance', [], true)
  registerState('gs.propSetting.breadcrumbList', [], true)
  registerState('gs.release', null, false)

  registerCommand('gc.fetch.instance', (_, rootInstanceId) => {
    fetchRootInstance(rootInstanceId);
  });

  registerCommand('gc.switchIstance', (_, instanceId) => {
    switchComponentInstance(instanceId)
  })

  registerCommand('gc.makeDataToStage', (_, refreshId) => {
    const list = getState('gs.allComponentInstance')
    if (refreshId === 'all' || refreshId === 'first') {
      const metadataList = instanceToMetadata(list);
      callHook('gh.component.propChange', metadataList, refreshId === 'first')
      return;
    }

    let instanceId = refreshId;
    if (refreshId === 'current') {
      instanceId = getState('gs.componentInstance').id;
    }

    const refreshInstance = list.find(i => i.id === instanceId);
    const [refreshMetadata] = instanceToMetadata([refreshInstance]);
    callHook('gh.component.propChange', refreshMetadata)
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

    const application = getContext().groot.params.application
    grootStateManager().setState('gs.stage.debugBaseUrl', release.debugBaseUrl || application.debugBaseUrl)
    grootStateManager().setState('gs.stage.playgroundPath', release.playgroundPath || application.playgroundPath)
    grootStateManager().setState('gs.release', release)
    grootStateManager().setState('gs.allComponentInstance', list)

    grootCommandManager().executeCommand('gc.makeDataToStage', 'first');
    switchComponentInstance(root.id);
  });
}

export const switchComponentInstance = (instanceId: number) => {
  const list = grootStateManager().getState('gs.allComponentInstance');
  const instance = list.find(item => item.id === instanceId);
  grootStateManager().setState('gs.componentInstance', instance);
  grootStateManager().setState('gs.component', instance.component);

  const breadcrumbList = grootStateManager().getState('gs.propSetting.breadcrumbList')
  breadcrumbList.length = 0;

  let ctxInstance = instance;
  do {
    breadcrumbList.push({ id: ctxInstance.id, name: ctxInstance.name });
    ctxInstance = list.find((item) => item.id === ctxInstance.parentId);
  } while (ctxInstance);
  breadcrumbList.reverse();
}
