import { useEffect, useState, } from "react";
import { useSearchParams } from "react-router-dom";

import { useRegisterModel } from "@util/robot";
import WorkbenchModel from "@model/WorkbenchModel";
import PropPersistModel from "@model/PropPersistModel";
import PropHandleModel from "@model/PropHandleModel";
import ScaffoldModel from "pages/Scaffold/ScaffoldModel";
import Workbench from "@components/Workbench";
import ComponentList from "./components/ComponentList";
import ComponentAddModal from "./components/ComponentAddModal";
import ComponentVersionAddModal from "./components/ComponentVersionAddModal";
import { Breadcrumb, Button, Dropdown, Menu, Modal, Tabs } from "antd";
import { BranchesOutlined, HomeOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import { ModalStatus } from "@util/common";

const Scaffold: React.FC = () => {
  const [scaffoldModel, scaffoldUpdateAction] = useRegisterModel(ScaffoldModel);
  const [workbenchModel] = useRegisterModel(WorkbenchModel);
  const [propHandleModel] = useRegisterModel(PropHandleModel);
  const [propPersistModel] = useRegisterModel(PropPersistModel);

  let [searchParams] = useSearchParams();

  useState(() => {
    propPersistModel.inject(workbenchModel, propHandleModel);
    scaffoldModel.inject(workbenchModel);
    workbenchModel.inject(propHandleModel);

    init();
  })

  useEffect(() => {
    const componentId = +searchParams.get('componentId');
    const versionId = +searchParams.get('versionId') || 1;
    const scaffoldId = +searchParams.get('scaffoldId');
    scaffoldModel.fetchScaffold(scaffoldId).then(() => {
      if (componentId) {
        scaffoldModel.switchComponent(componentId, versionId);
      } else if (scaffoldModel.scaffold.componentList.length) {
        const component = scaffoldModel.scaffold.componentList[0];
        scaffoldModel.switchComponent(component.id, versionId);
      }
    })
  }, []);

  function init() {
    workbenchModel.renderExtraTabPanes.push(() => {
      return (<Tabs.TabPane key="scaffold" tab="脚手架">
        {<ComponentList />}
      </Tabs.TabPane>)
    });

    workbenchModel.renderFooterLeftActionItems.push(() => {
      const versionListMenu = workbenchModel.component?.versionList.map((version) => {
        return {
          key: version.id,
          label: (<a
            onClick={() => {
              scaffoldModel.switchComponent(workbenchModel.component.id, version.id, true);
            }}>
            {version.name}
            {workbenchModel.component.recentVersionId === version.id ? <strong>Active</strong> : null}
          </a>)
        }
      })

      return (<Dropdown placement="topLeft" overlay={<Menu items={versionListMenu} />}>
        <span>
          <BranchesOutlined title="版本" />
          <span>{workbenchModel.component?.version.name}</span>
        </span>
      </Dropdown>)
    });

    workbenchModel.renderFooterLeftActionItems.push(() => {
      return (<div onClick={() => scaffoldUpdateAction(() => scaffoldModel.componentVersionAddModalStatus = ModalStatus.Init)}>
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
              scaffoldModel.publish(workbenchModel.component.id, workbenchModel.component.version.id)
            }
          })
        }}
      />)
    }

    (Object.getPrototypeOf(workbenchModel) as WorkbenchModel).renderToolBarBreadcrumb = () => {
      return (<Breadcrumb separator=">">
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="">{workbenchModel.component?.name}</Breadcrumb.Item>
      </Breadcrumb>)
    }
  }

  if (scaffoldModel.scaffold === undefined) {
    return <>loading</>
  } else if (scaffoldModel.scaffold === null) {
    return <>notfound component</>
  } else {
    return (<>
      <Workbench />
      <ComponentAddModal />
      <ComponentVersionAddModal />
    </>);
  }
}

export default Scaffold;