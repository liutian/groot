import { useEffect, } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumb, Button, Dropdown, Menu, Tabs } from "antd";
import { BranchesOutlined, HomeOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";

import styles from './index.module.less';
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

const Editor: React.FC = () => {
  const [editorModel, editorUpdateAction] = useRegisterModel<EditorModel>(EditorModel.modelName, new EditorModel());
  const [workbenchModel, workbenchUpdateAction] = useRegisterModel<WorkbenchModel>(WorkbenchModel.modelName, new WorkbenchModel());
  const [propHandleModel] = useRegisterModel<PropHandleModel>(PropHandleModel.modelName, new PropHandleModel());
  const [propPersistModel] = useRegisterModel<PropPersistModel>(PropPersistModel.modelName, new PropPersistModel());

  let [searchParams] = useSearchParams();

  const releaseAdd = () => {
    editorUpdateAction(() => {
      editorModel.showReleaseAddModal = true;
    })
  }

  useEffect(() => {
    propPersistModel.inject(workbenchModel, propHandleModel);
    editorModel.inject(workbenchModel);
    workbenchModel.inject(propHandleModel);

    workbenchUpdateAction(() => {

      Object.getPrototypeOf(workbenchModel).renderExtraTabPanes = () => {
        return (
          <Tabs.TabPane key="application" tab="应用页面">
            {renderList()}
          </Tabs.TabPane>
        )
      }

      workbenchModel.renderFooterLeftActionItems.push(() => {
        const releaseListMenu = editorModel.application.releaseList.map((release) => {
          return {
            key: release.id,
            label: (<a >
              {release.name}
              {editorModel.application.devReleaseId === release.id ? <strong style={{ color: 'green' }}>DEV</strong> : null}
              {editorModel.application.qaReleaseId === release.id ? <strong style={{ color: 'blue' }}>QA</strong> : null}
              {editorModel.application.plReleaseId === release.id ? <strong style={{ color: 'orange' }}>PL</strong> : null}
              {editorModel.application.onlineReleaseId === release.id ? <strong style={{ color: 'red' }}>OL</strong> : null}
            </a>),
            onClick: () => {
              editorModel.switchRelease(release.id);
            }
          }
        })

        return (<Dropdown placement="topLeft" overlay={<Menu items={releaseListMenu} />}>
          <span >
            <BranchesOutlined title="迭代" />
            <span>{editorModel.application.release.name}</span>
          </span>
        </Dropdown>)
      });

      workbenchModel.renderFooterLeftActionItems.push(() => {
        return (<div onClick={releaseAdd}>
          <PlusOutlined />
        </div>)
      });

      Object.getPrototypeOf(workbenchModel).renderToolBarAction = () => {
        return (<>
          <Button type="link" title="部署" icon={<SendOutlined />} onClick={() => {
            editorUpdateAction(() => {
              editorModel.showAssetBuildModal = true;
            })
          }} />
        </>)
      }

      Object.getPrototypeOf(workbenchModel).renderToolBarBreadcrumb = () => {
        return (<>
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="">{workbenchModel.componentInstance?.name}</Breadcrumb.Item>
          </Breadcrumb>
        </>)
      }
    }, false)

    const applicationId = +searchParams.get('applicationId');
    const releaseId = +searchParams.get('releaseId');
    const instanceId = +searchParams.get('instanceId');
    editorModel.fetchApplication(applicationId, releaseId).then(() => {
      if (instanceId) {
        editorModel.switchComponentInstance(instanceId);
      } else if (editorModel.application.release.instanceList.length) {
        const instance = editorModel.application.release.instanceList[0];
        editorModel.switchComponentInstance(instance.id);
      }
    })
  }, []);

  const renderList = () => {
    const pageComponentInstanceList = editorModel.application.release.instanceList;
    const componentList = pageComponentInstanceList.map((componentInstance) => {
      return {
        label: componentInstance.name,
        key: componentInstance.id,
        onClick: () => {
          if (workbenchModel.componentInstance.id === componentInstance.id) {
            return;
          }

          editorModel.switchComponentInstance(componentInstance.id, true);
        }
      };
    });

    const showPageAdd = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      editorUpdateAction(() => editorModel.showPageAddModal = true);
      e.stopPropagation();
    }

    const componentTypes = [
      { label: '页面', key: 'page', children: componentList },
      { label: '公共模版', key: 'templatePage', children: [] },
    ]

    const renderActions = () => {
      return <>
        <Button icon={<PlusOutlined />} type="link" onClick={showPageAdd} />
      </>
    }

    return <Menu mode="inline" className={styles.menuContainer} expandIcon={renderActions()} selectedKeys={[`${workbenchModel.componentInstance?.id}`]} items={componentTypes} />
  }

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