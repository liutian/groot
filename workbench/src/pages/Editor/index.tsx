import { useEffect, } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Menu, Tabs } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import styles from './index.module.less';
import { useRegisterModel } from "@util/robot";
import WorkbenchModel from "@model/WorkbenchModel";
import PropPersistModel from "@model/PropPersistModel";
import PropHandleModel from "@model/PropHandleModel";
import Workbench from "@components/Workbench";
import EditorModel from "./EditorModel";
import PageAddModal from "./components/PageAddModal";

const Editor: React.FC = () => {
  const [editorModel, editorUpdateAction] = useRegisterModel<EditorModel>(EditorModel.modelName, new EditorModel());
  const [workbenchModel, workbenchUpdateAction] = useRegisterModel<WorkbenchModel>(WorkbenchModel.modelName, new WorkbenchModel());
  const [propHandleModel] = useRegisterModel<PropHandleModel>(PropHandleModel.modelName, new PropHandleModel());
  const [propPersistModel] = useRegisterModel<PropPersistModel>(PropPersistModel.modelName, new PropPersistModel());

  let [searchParams] = useSearchParams();

  useEffect(() => {
    propPersistModel.inject(workbenchModel, propHandleModel);
    editorModel.inject(workbenchModel);
    workbenchModel.inject(propHandleModel);
    Object.getPrototypeOf(workbenchModel).renderExtraTabPanes = () => {
      return (
        <Tabs.TabPane key="application" tab="应用页面">
          {renderList()}
        </Tabs.TabPane>
      )
    }

    workbenchModel.renderFooterLeftActionItems.push(() => {
      return (<span>{workbenchModel.component?.version.name}</span>)
    });

    workbenchModel.renderFooterLeftActionItems.push(() => {
      return (<div >
        <PlusOutlined />
      </div>)
    });

    const applicationId = +searchParams.get('applicationId');
    const releaseId = +searchParams.get('releaseId');
    const instanceId = +searchParams.get('instanceId');
    editorModel.fetchApplication(applicationId, releaseId).then(() => {
      if (instanceId) {
        editorModel.switchComponent(instanceId, releaseId);
      } else if (editorModel.application.release.instanceList.length) {
        const instance = editorModel.application.release.instanceList[0];
        editorModel.switchComponent(instance.id, releaseId);
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

          workbenchUpdateAction(() => {
            workbenchModel.currActiveTab = 'props';
          });
          editorModel.switchComponent(componentInstance.id, editorModel.application.release.id);
          window.history.pushState(null, '', `?applicationId=${editorModel.application.id}&releaseId=${editorModel.application.release.id}&instanceId=${componentInstance.id}`);
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
    </>);
  }
}

export default Editor;