import { PlusOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";

import WorkbenchModel from "@model/WorkbenchModel";
import { ModalStatus } from "@util/common";
import { useModel } from "@util/robot";
import EditorModel from "pages/Instance/InstanceModel";

import styles from './index.module.less';

const InstanceList: React.FC = () => {
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
    { label: '主要', key: 'entry', children: componentList },
    { label: '其他', key: 'no-entry', children: [] },
  ]

  const renderActions = () => {
    return <>
      <Button icon={<PlusOutlined />} type="link" onClick={showPageAdd} />
    </>
  }

  return <Menu mode="inline" openKeys={['entry']} className={styles.menuContainer} expandIcon={renderActions()} selectedKeys={[`${workbenchModel.componentInstance?.id}`]} items={componentTypes} />
}

export default InstanceList;