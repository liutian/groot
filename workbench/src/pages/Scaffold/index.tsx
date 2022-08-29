import { useEffect, } from "react";
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

const Scaffold: React.FC = () => {
  const [scaffoldModel, scaffoldUpdateAction] = useRegisterModel<ScaffoldModel>(ScaffoldModel.modelName, new ScaffoldModel());
  const [workbenchModel, workbenchUpdateAction] = useRegisterModel<WorkbenchModel>(WorkbenchModel.modelName, new WorkbenchModel());
  const [propHandleModel] = useRegisterModel<PropHandleModel>(PropHandleModel.modelName, new PropHandleModel());
  const [propPersistModel] = useRegisterModel<PropPersistModel>(PropPersistModel.modelName, new PropPersistModel());

  let [searchParams] = useSearchParams();

  useEffect(() => {
    propPersistModel.inject(workbenchModel, propHandleModel);
    scaffoldModel.inject(workbenchModel);
    workbenchModel.inject(propHandleModel);
    workbenchUpdateAction(() => {
      Object.getPrototypeOf(workbenchModel).renderExtraTabPanes = () => {
        return (<Tabs.TabPane key="scaffold" tab="脚手架">
          {<ComponentList />}
        </Tabs.TabPane>)
      };

      workbenchModel.renderFooterLeftActionItems.push(() => {
        const versionListMenu = workbenchModel.component?.versionList.map((version) => {
          return {
            key: version.id,
            label: (<a
              onClick={() => scaffoldModel.switchComponent(workbenchModel.component.id, version.id)}>
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
        return (<div onClick={() => scaffoldUpdateAction(() => scaffoldModel.showComponentVersionAddModal = true)}>
          <PlusOutlined />
        </div>)
      });

      Object.getPrototypeOf(workbenchModel).renderToolBarAction = () => {
        return (<>
          <Button type="link" title="发布" icon={<SendOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确定发布版本',
                content: '发布之后版本无法更新',
                onOk: () => {
                  scaffoldModel.publish(workbenchModel.component.id, workbenchModel.component.version.id)
                }
              })
            }}
          />
        </>)
      }

      Object.getPrototypeOf(workbenchModel).renderToolBarBreadcrumb = () => {
        return (<>
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="">{workbenchModel.component?.name}</Breadcrumb.Item>
          </Breadcrumb>
        </>)
      }
    }, false)

    const componentId = +searchParams.get('componentId');
    const versionId = +searchParams.get('versionId');
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