import { useEffect, useState, } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumb, Button, Tabs } from "antd";
import { HomeOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";

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
import InstanceList from "./components/InstanceList";
import Release from "./components/Release";
import { BreadcrumbChange, ModalStatus } from "@util/common";
import { PostMessageType } from "@grootio/common";

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

    init();
  });

  useEffect(() => {
    const applicationId = +searchParams.get('app');
    const releaseId = +searchParams.get('release');
    const instanceId = +searchParams.get('page');
    instanceModel.fetchApplication(applicationId, releaseId).then(() => {
      if (instanceId) {
        instanceModel.fetchRootInstance(instanceId);
      } else if (workbenchModel.application.release.instanceList.length) {
        const instance = workbenchModel.application.release.instanceList[0];
        instanceModel.fetchRootInstance(instance.id);
      }
    })
  }, []);

  function init() {
    workbenchModel.renderExtraTabPanes.push(() => {
      return (<Tabs.TabPane key="instance-list" tab="实例列表"><InstanceList /></Tabs.TabPane>)
    });

    workbenchModel.renderExtraTabPanes.push(() => {
      return (<Tabs.TabPane key="prototype-list" tab="原型列表"><DragComponentList /></Tabs.TabPane>)
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
        <Breadcrumb.Item >
          <HomeOutlined />
        </Breadcrumb.Item>
        {
          instanceModel.breadcrumbList.map((item) => {
            return (<Breadcrumb.Item key={item.id}
              onClick={() => {
                workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterWrapperSelect, {
                  id: item.id,
                  action: BreadcrumbChange.Insert
                })
              }}>
              {item.name}
            </Breadcrumb.Item>)
          })
        }
      </Breadcrumb>)
    }

    (Object.getPrototypeOf(workbenchModel) as WorkbenchModel).switchComponentInstance = (instanceId, breadcrumbAppend = BreadcrumbChange.Append) => {
      instanceModel.switchComponentInstance(instanceId, breadcrumbAppend);
    }

  }

  if (instanceModel.loadStatus === 'doing') {
    return <>loading</>
  } else if (instanceModel.loadStatus === 'no-application') {
    return <>not found application</>
  } else if (instanceModel.loadStatus === 'no-component') {
    return <>not found component</>
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