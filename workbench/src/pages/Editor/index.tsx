import { useEffect, useState, } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumb, Button, Tabs } from "antd";
import { HomeOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";

import { useRegisterModel } from "@util/robot";
import WorkbenchModel from "@model/WorkbenchModel";
import PropPersistModel from "@model/PropPersistModel";
import PropHandleModel from "@model/PropHandleModel";
import Workbench from "@components/Workbench";
import EditorModel from "./EditorModel";
import PageAddModal from "./components/PageAddModal";
import ReleaseAddModal from "./components/ReleaseAddModal";
import BuildModal from "./components/BuildModal";
import DeployModal from "./components/DeployModal";
import { DragComponentList } from "./components/DragComponentList";
import PageList from "./components/PageList";
import Release from "./components/Release";

const Editor: React.FC = () => {
  const [editorModel, editorUpdateAction] = useRegisterModel<EditorModel>(EditorModel.modelName, new EditorModel());
  const [workbenchModel] = useRegisterModel<WorkbenchModel>(WorkbenchModel.modelName, new WorkbenchModel());
  const [propHandleModel] = useRegisterModel<PropHandleModel>(PropHandleModel.modelName, new PropHandleModel());
  const [propPersistModel] = useRegisterModel<PropPersistModel>(PropPersistModel.modelName, new PropPersistModel());

  useState(() => {
    propPersistModel.inject(workbenchModel, propHandleModel);
    editorModel.inject(workbenchModel);
    workbenchModel.inject(propHandleModel);

    workbenchModel.renderExtraTabPanes.push(() => {
      return (<Tabs.TabPane key="application" tab="应用页面"><PageList /></Tabs.TabPane>)
    });

    workbenchModel.renderExtraTabPanes.push(() => {
      return (<Tabs.TabPane key="component" tab="组件列表"><DragComponentList /></Tabs.TabPane>)
    });

    workbenchModel.renderFooterLeftActionItems.push(() => {
      return <Release />
    });

    workbenchModel.renderFooterLeftActionItems.push(() => {
      return (<div onClick={() => {
        editorUpdateAction(() => {
          editorModel.showReleaseAddModal = true;
        })
      }}>
        <PlusOutlined />
      </div>)
    });

    (Object.getPrototypeOf(workbenchModel) as WorkbenchModel).renderToolBarAction = () => {
      return (<>
        <Button type="link" title="部署" icon={<SendOutlined />} onClick={() => {
          editorUpdateAction(() => {
            editorModel.showAssetBuildModal = true;
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
          editorModel.breadcrumbList.map((item) => {
            return (<Breadcrumb.Item key={item.id}
              onClick={() => editorModel.switchComponentInstance(item.id, false, false)}>
              {item.name}
            </Breadcrumb.Item>)
          })
        }
      </Breadcrumb>)
    }

    (Object.getPrototypeOf(workbenchModel) as WorkbenchModel).switchComponentInstance = (instanceId) => {
      editorModel.switchComponentInstance(instanceId, false, true);
    }
  });

  let [searchParams] = useSearchParams();

  useEffect(() => {
    const applicationId = +searchParams.get('applicationId');
    const releaseId = +searchParams.get('releaseId');
    const instanceId = +searchParams.get('instanceId');
    editorModel.fetchApplication(applicationId, releaseId).then(() => {
      if (instanceId) {
        editorModel.switchComponentInstance(instanceId, false, false);
      } else if (editorModel.application.release.instanceList.length) {
        const instance = editorModel.application.release.instanceList[0];
        editorModel.switchComponentInstance(instance.id, false, false);
      }
    })
  }, []);

  if (editorModel.application === undefined) {
    return <>loading</>
  } else if (editorModel.application === null) {
    return <>notfound component</>
  } else {
    return (<>
      <Workbench />
      <PageAddModal />
      <ReleaseAddModal />
      <BuildModal />
      <DeployModal />
    </>);
  }
}

export default Editor;