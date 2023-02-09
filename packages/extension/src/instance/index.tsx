import { AppstoreOutlined } from "@ant-design/icons";
import { APIPath, GrootCommandDict, GrootStateDict } from "@grootio/common";
import { getContext } from "context";
import ViewsContainer from "core/ViewsContainer";
import { PropSetter } from "share/PropSetter";
import { WorkArea } from "share/WorkArea";
import { Application } from "./Application";
import { Material } from "./Material";


export const instanceBootstrap = () => {
  const { groot } = getContext();
  const { registerState } = groot.stateManager<GrootStateDict>();
  const { registerCommand, executeCommand } = groot.commandManager<GrootCommandDict>();

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
  ])

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
  ])

  registerState('gs.workbench.activityBar.view', [
    'application', 'material'
  ])
  registerState('gs.workbench.activityBar.active', 'application');
  registerState('gs.workbench.primarySidebar.view', 'application');
  registerState('gs.workbench.secondarySidebar.view', 'propSetter');
  registerState('gs.workbench.stage.view', 'workArea');


  registerState('gs.studio.rootComponentInstance', null)
  registerState('gs.studio.component', null)
  registerState('gs.studio.componentVersion', null)
  registerState('gs.studio.allComponentInstance', null)

  groot.layout.design('visible', 'secondarySidebar', true);
  groot.layout.design('visible', 'panel', false);

  registerCommand('gc.fetch.instance', (_, rootInstanceId) => {
    fetchRootInstance(rootInstanceId);
  });

  groot.onReady(() => {
    executeCommand('gc.fetch.instance', groot.params.instanceId)
  })
}

const fetchRootInstance = (rootInstanceId: number) => {
  const { request, groot: { stateManager } } = getContext();
  request(APIPath.componentInstance_rootDetail_instanceId, { instanceId: rootInstanceId }).then(({ data: { children, root } }) => {
    // this.breadcrumbList.length = 0;
    // this.breadcrumbList.push({ id: rootInstanceId, name: root.name });

    stateManager<GrootStateDict>().setState('gs.studio.rootComponentInstance', root)
    stateManager<GrootStateDict>().setState('gs.studio.component', root.component)
    stateManager<GrootStateDict>().setState('gs.studio.componentVersion', root.componentVersion)
    stateManager<GrootStateDict>().setState('gs.studio.allComponentInstance', [root, ...children])
    // this.globalStateList = rootInstance.stateList.filter(item => !item.instanceId);
    // this.pageStateList = rootInstance.stateList.filter(item => !!item.instanceId);

    const { groupList, blockList, itemList, valueList } = root;
    // const propTree = this.propHandle.buildPropTree(groupList, blockList, itemList, valueList);
    // rootInstance.propTree = propTree;

    // this.iframeReadyPromise.then(() => {
    //   this.iframeManager.refresh(() => {
    //     this.propHandle.refreshAllComponent();
    //   });
    // });

    // window.history.pushState(null, '', `?app=${this.application.id}&release=${this.application.release.id}&page=${rootInstance.id}`);
    // this.dispatchEvent(new Event(WorkbenchEvent.LaunchFinish));
  });
}