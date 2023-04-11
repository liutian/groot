import { AppstoreOutlined } from "@ant-design/icons";
import { APIPath, ExtScriptModule, PropBlockStructType, PropGroup } from "@grootio/common";
import { metadataFactory, propItemPipeline, propTreeFactory } from "@grootio/core";
import { getContext, grootManager } from "context";
import ViewsContainer from "core/ViewsContainer";
import { parseOptions } from "util/utils";
import { Solution } from "./Solution";


const propItemPipelineModuleList: ExtScriptModule[] = []

export const prototypeBootstrap = () => {
  const { groot, layout, params } = getContext();
  const { registerState, getState, setState } = grootManager.state
  const { registerCommand, executeCommand } = grootManager.command

  getState('gs.ui.viewsContainers').push(...[
    {
      id: 'solution',
      name: '组件',
      icon: () => {
        return <AppstoreOutlined />
      },
      view: function () {
        return <ViewsContainer context={this} />
      },
    }
  ])

  getState('gs.ui.views').push(...[
    {
      id: 'solutio',
      name: '组件',
      view: <Solution />,
      parent: 'solution'
    },
  ])


  registerState('gs.ui.activityBar.viewsContainers', ['solution'], true)
  registerState('gs.ui.activityBar.active', 'solution', false);
  registerState('gs.ui.primarySidebar.active', 'solution', false);
  registerState('gs.component', null, false)

  registerCommand('gc.fetch.prototype', (_, componentId, versionId) => {
    fetchComponent(componentId, versionId);
  })

  registerCommand('gc.makeDataToStage', (_, refreshId) => {
    syncDataToStage(refreshId === 'first');
  })

  layout.primarySidebarWidth = '220px'

  groot.onReady(() => {
    setState('gs.stage.debugBaseUrl', params.solution.solutionVersion.debugBaseUrl)
    setState('gs.stage.playgroundPath', params.solution.solutionVersion.playgroundPath)
    executeCommand('gc.fetch.prototype', params.componentId, params.versionId)
  })
}

const fetchComponent = (componentId: number, versionId) => {
  const { request } = getContext();
  request(APIPath.componentPrototype_detail_componentId, { componentId, versionId }).then(({ data }) => {
    const { blockList, itemList } = data;
    blockList.filter(block => block.struct === PropBlockStructType.List).forEach((block) => {
      block.listStructData = JSON.parse(block.listStructData as any || '[]');
    })

    itemList.forEach(item => {
      parseOptions(item);
    })


    grootManager.state.setState('gs.component', data)
    grootManager.command.executeCommand('gc.makeDataToStage', 'first')
  })
}

const syncDataToStage = (first = false) => {
  const component = grootManager.state.getState('gs.component');

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

  const metadata = metadataFactory(component.propTree, {
    packageName: component.packageName,
    componentName: component.componentName,
    metadataId: component.id,
  }, (params) => {
    propItemPipeline([], [], propItemPipelineModuleList, params)
  });
  grootManager.hook.callHook('gh.component.propChange', metadata, first)
}