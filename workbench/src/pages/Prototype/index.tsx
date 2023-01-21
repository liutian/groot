import { AppstoreOutlined, BranchesOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Dropdown, Modal } from "antd";
import { useEffect, useState, } from "react";
import { ModalStatus, RuntimeHostConfig, useRegisterModel } from "@grootio/common";

import WorkbenchModel from "@model/WorkbenchModel";
import PropPersistModel from "@model/PropPersistModel";
import PropHandleModel from "@model/PropHandleModel";
import PrototypeModel from "pages/Prototype/PrototypeModel";
import Workbench from "@components/Workbench";
import ComponentList from "./components/ComponentList";
import ComponentAddModal from "./components/ComponentAddModal";
import ComponentVersionAddModal from "./components/ComponentVersionAddModal";
import Loading from "@components/Loading";
import ConfigLoader from "@components/ConfigLoader";
import styles from './index.module.less';


type PropsType = {
  orgId: number,
  componentId?: number,
  versionId?: number
}

const Prototype: React.FC<PropsType> = ({ orgId, componentId, versionId }) => {
  const prototypeModel = useRegisterModel(PrototypeModel);
  const workbenchModel = useRegisterModel(WorkbenchModel);
  const propHandleModel = useRegisterModel(PropHandleModel);
  const propPersistModel = useRegisterModel(PropPersistModel);

  useState(() => {
    propPersistModel.inject(workbenchModel, propHandleModel);
    propHandleModel.inject(workbenchModel, propPersistModel);
    workbenchModel.inject(propHandleModel);
    prototypeModel.inject(workbenchModel);
  })

  useEffect(() => {
    prototypeModel.fetchOrg(orgId);
  }, []);

  const fetchPluginFinish = (config: RuntimeHostConfig) => {
    initView();
    workbenchModel.processConfig(config);

    if (componentId) {
      prototypeModel.switchComponent(componentId, versionId);
    } else if (workbenchModel.org.componentList.length) {
      const component = workbenchModel.org.componentList[0];
      prototypeModel.switchComponent(component.id, versionId);
    }
  }

  function initView() {
    workbenchModel.sidebarView.push({
      key: 'component-list',
      title: '组件库',
      icon: <AppstoreOutlined />,
      view: <ComponentList />
    });

    workbenchModel.renderFooterLeftActionItems.push(() => {
      const versionListMenu = workbenchModel.component?.versionList.map((version) => {
        return {
          key: version.id,
          label: (<a
            onClick={() => {
              prototypeModel.switchComponent(workbenchModel.component.id, version.id);
            }}>
            {version.name}
            {workbenchModel.component.recentVersionId === version.id ? <strong>Active</strong> : null}
          </a>)
        }
      })

      return (<Dropdown placement="topLeft" menu={{ items: versionListMenu }}>
        <span>
          <BranchesOutlined title="版本" />
          <span>{workbenchModel.componentVersion.name}</span>
        </span>
      </Dropdown>)
    });

    workbenchModel.renderFooterLeftActionItems.push(() => {
      return (<div onClick={() => prototypeModel.componentVersionAddModalStatus = ModalStatus.Init}>
        <PlusOutlined />
      </div>)
    });

    (Object.getPrototypeOf(workbenchModel) as WorkbenchModel).renderToolBarAction = () => {
      return (<Button type="link" title="发布" icon={<SendOutlined />}
        onClick={() => {
          Modal.confirm({
            title: '确定发布版本',
            content: '发布之后版本无法更新',
            onOk: () => {
              prototypeModel.publish(workbenchModel.component.id, workbenchModel.componentVersion.id)
            }
          })
        }}
      />)
    }

    (Object.getPrototypeOf(workbenchModel) as WorkbenchModel).renderToolBarBreadcrumb = () => {
      return (<Breadcrumb separator=">">
        <Breadcrumb.Item href="">{workbenchModel.component?.name}</Breadcrumb.Item>
      </Breadcrumb>)
    }
  }

  if (prototypeModel.loadStatus === 'doing') {
    return <Loading text="loading data ..." />
  } else if (prototypeModel.loadStatus === 'notfound') {
    return <>notfound component</>
  } else if (prototypeModel.loadStatus === 'fetch-pluginn') {
    return <ConfigLoader finish={fetchPluginFinish} />
  } else {
    return (<div className={styles.container}>
      <Workbench />
      <ComponentAddModal />
      <ComponentVersionAddModal />
    </div>);
  }
}

export default Prototype;