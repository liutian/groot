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

const Editor: React.FC = () => {
  const [editorModel] = useRegisterModel<EditorModel>(EditorModel.modelName, new EditorModel());
  const [workbenchModel, workbenchUpdateAction] = useRegisterModel<WorkbenchModel>(WorkbenchModel.modelName, new WorkbenchModel());
  const [propHandleModel] = useRegisterModel<PropHandleModel>(PropHandleModel.modelName, new PropHandleModel());
  const [propPersistModel] = useRegisterModel<PropPersistModel>(PropPersistModel.modelName, new PropPersistModel());

  let [searchParams] = useSearchParams();

  useEffect(() => {
    propPersistModel.inject(workbenchModel, propHandleModel);
    editorModel.inject(workbenchModel);
    workbenchModel.inject(propHandleModel);
    workbenchModel.extraTabPanes.push((
      <Tabs.TabPane key="application" tab="应用页面">
        {renderList()}
      </Tabs.TabPane>
    ))

    editorModel.fetchApplication(+searchParams.get('applicationId'));
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
        }
      };
    });

    const componentTypes = [
      { label: '页面', key: 'page', children: componentList },
      { label: '公共模版', key: 'templatePage', children: [] },
    ]

    const renderActions = () => {
      return <>
        <Button icon={<PlusOutlined />} type="link" />
      </>
    }

    return <Menu mode="inline" className={styles.menuContainer} expandIcon={renderActions()} selectedKeys={[`${workbenchModel.component?.id}`]} items={componentTypes} />
  }

  if (editorModel.application === undefined) {
    return <>loading</>
  } else if (editorModel.application === null) {
    return <>notfound component</>
  } else {
    return (<Workbench />);
  }
}

export default Editor;