import { PlusOutlined } from "@ant-design/icons";
import WorkbenchModel from "@model/WorkbenchModel";
import { ModalStatus } from "@util/common";
import { useModel } from "@util/robot";
import { Button, Menu } from "antd";
import EditorModel from "pages/Instance/InstanceModel";

import styles from './index.module.less';

const PageList: React.FC = () => {
  const [editorModel, editorUpdateAction] = useModel(EditorModel);
  const [workbenchModel] = useModel(WorkbenchModel);

  const pageComponentInstanceList = workbenchModel.application.release.instanceList;
  const componentList = pageComponentInstanceList.map((componentInstance) => {
    return {
      label: componentInstance.name,
      key: componentInstance.id,
      onClick: () => {
        if (workbenchModel.componentInstance.id === componentInstance.id) {
          return;
        }

        editorModel.fetchPage(componentInstance.id);
      }
    };
  });

  const showPageAdd = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    editorUpdateAction(() => editorModel.pageAddModalStatus = ModalStatus.Init);
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

export default PageList;