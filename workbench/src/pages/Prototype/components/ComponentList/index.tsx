import { PlusOutlined } from "@ant-design/icons";
import WorkbenchModel from "@model/WorkbenchModel";
import { ModalStatus } from "@util/common";
import { useModel, } from "@util/robot";
import { Button, Menu, } from "antd";
import PrototypeModel from "pages/Prototype/PrototypeModel";
import styles from './index.module.less';

const ComponentList: React.FC = () => {
  const [prototypeModel, prototypeUpdateAction] = useModel(PrototypeModel);
  const [workbenchModel] = useModel(WorkbenchModel);

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
    prototypeUpdateAction(() => prototypeModel.componentAddModalStatus = ModalStatus.Init);
    e.stopPropagation();
  }

  const componentTypes = [
    { label: '组件', key: 'component', children: componentList },
    { label: '容器', key: 'container', children: [] },
  ]

  const renderActions = () => {
    return <>
      <Button icon={<PlusOutlined />} type="link" onClick={showComponentAdd} />
    </>
  }

  return <Menu mode="inline" className={styles.menuContainer} expandIcon={renderActions()} selectedKeys={[`${workbenchModel.component?.id}`]} items={componentTypes} />
}

export default ComponentList;