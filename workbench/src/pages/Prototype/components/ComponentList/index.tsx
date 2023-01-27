import { PlusOutlined } from "@ant-design/icons";
import { ComponentParserType, ModalStatus, useModel } from "@grootio/common";
import { Button, Menu, } from "antd";

import WorkbenchModel from "@model/WorkbenchModel";
import PrototypeModel from "pages/Prototype/PrototypeModel";

import styles from './index.module.less';

const ComponentList: React.FC = () => {
  const prototypeModel = useModel(PrototypeModel);
  const workbenchModel = useModel(WorkbenchModel);

  const componentList = workbenchModel.org.componentList.map((component) => {
    return {
      label: component.name,
      key: component.id,
      onClick: () => {
        if (workbenchModel.component.id === component.id) {
          return;
        }

        prototypeModel.switchComponent(component.id, component.recentVersionId);
      }
    };
  });

  const showComponentAdd = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    prototypeModel.componentAddModalStatus = ModalStatus.Init
    e.stopPropagation();
  }

  const componentTypes = [
    { label: '组件', key: ComponentParserType.ReactComponent, children: componentList },
  ]

  const renderActions = () => {
    return <>
      <Button icon={<PlusOutlined />} type="link" onClick={showComponentAdd} />
    </>
  }

  return <Menu mode="inline" openKeys={[ComponentParserType.ReactComponent.toString()]} className={styles.menuContainer} expandIcon={renderActions()} selectedKeys={[`${workbenchModel.component?.id}`]} items={componentTypes} />
}

export default ComponentList;