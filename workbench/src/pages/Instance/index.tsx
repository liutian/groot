import { AppstoreOutlined, PlusOutlined, SendOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useEffect, useState, } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumb, Button } from "antd";

import { useRegisterModel } from "@util/robot";
import WorkbenchModel from "@model/WorkbenchModel";
import PropPersistModel from "@model/PropPersistModel";
import PropHandleModel from "@model/PropHandleModel";
import Workbench from "@components/Workbench";
import InstanceModel from "./InstanceModel";
import InstanceAddModal from "./components/InstanceAddModal";
import ReleaseAddModal from "./components/ReleaseAddModal";
import BuildModal from "./components/BuildModal";
import DeployModal from "./components/DeployModal";
import { DragComponentList } from "./components/DragComponentList";
import Release from "./components/Release";
import { ModalStatus, WorkbenchEvent } from "@util/common";
import { PostMessageType, RuntimeHostConfig } from "@grootio/common";
import ConfigLoader from "@components/ConfigLoader";
import Loading from "@components/Loading";
import InstanceList from "./components/InstanceList";

const Instance: React.FC = () => {
  const [instanceModel, instanceModelAction] = useRegisterModel(InstanceModel);
  const [workbenchModel] = useRegisterModel(WorkbenchModel);
  const [propHandleModel] = useRegisterModel(PropHandleModel);
  const [propPersistModel] = useRegisterModel(PropPersistModel);

  let [searchParams] = useSearchParams();

  useState(() => {
    propPersistModel.inject(workbenchModel, propHandleModel);
    propHandleModel.inject(workbenchModel, propPersistModel);
    workbenchModel.inject(propHandleModel);
    instanceModel.inject(workbenchModel);
  });

  useEffect(() => {
    const applicationId = +searchParams.get('app');
    const releaseId = +searchParams.get('release');
    instanceModel.fetchApplication(applicationId, releaseId);
  }, []);

  const fetchPluginFinish = (config: RuntimeHostConfig) => {
    initView();
    workbenchModel.processConfig(config);

    const instanceId = +searchParams.get('page');
    if (instanceId) {
      instanceModel.fetchRootInstance(instanceId);
    } else if (workbenchModel.application.release.instanceList.length) {
      const instance = workbenchModel.application.release.instanceList[0];
      instanceModel.fetchRootInstance(instance.id);
    }
  }

  function initView() {
    workbenchModel.sidebarView.push({
      key: 'component-list',
      title: '组件库',
      icon: <AppstoreOutlined />,
      view: <DragComponentList />
    }, {
      key: 'instance-list',
      title: '实例列表',
      icon: <UnorderedListOutlined />,
      view: <InstanceList />
    });

    workbenchModel.renderFooterLeftActionItems.push(() => {
      return <Release />
    });

    workbenchModel.renderFooterLeftActionItems.push(() => {
      return (<div onClick={() => {
        instanceModelAction(() => {
          instanceModel.releaseAddModalStatus = ModalStatus.Init;
        })
      }}>
        <PlusOutlined />
      </div>)
    });

    (Object.getPrototypeOf(workbenchModel) as WorkbenchModel).renderToolBarAction = () => {
      return (<>
        <Button type="link" title="部署" icon={<SendOutlined />} onClick={() => {
          instanceModelAction(() => {
            instanceModel.assetBuildModalStatus = ModalStatus.Init;
          })
        }} />
      </>)
    }

    (Object.getPrototypeOf(workbenchModel) as WorkbenchModel).renderToolBarBreadcrumb = () => {
      return (<Breadcrumb separator=">">
        {
          instanceModel.breadcrumbList.map((item, index) => {
            return (<Breadcrumb.Item key={item.id}
              onClick={() => {
                if (index === instanceModel.breadcrumbList.length - 1) {
                  return;
                } else if (index > 0) {
                  workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterWrapperSelect, item.id)
                } else {
                  // 根组件不需要选择效果，直接切换，并清空标记
                  instanceModel.switchComponentInstance(item.id);
                  workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterOutlineReset);
                }
              }}>
              {index === 0 ? '页面' : item.name}
            </Breadcrumb.Item>)
          })
        }
      </Breadcrumb>)
    }

    (Object.getPrototypeOf(workbenchModel) as WorkbenchModel).switchComponentInstance = (instanceId) => {
      instanceModel.switchComponentInstance(instanceId);
    }
  }

  if (instanceModel.loadStatus === 'doing') {
    return <Loading text="loading data ..." />
  } else if (instanceModel.loadStatus === 'no-application') {
    return <>not found application</>
  } else if (instanceModel.loadStatus === 'no-component') {
    return <>not found component</>
  } else if (instanceModel.loadStatus === 'fetch-pluginn') {
    return <ConfigLoader finish={fetchPluginFinish} />
  } else {
    return (<>
      <Workbench />
      <InstanceAddModal />
      <ReleaseAddModal />
      <BuildModal />
      <DeployModal />
    </>);
  }
}

export default Instance;