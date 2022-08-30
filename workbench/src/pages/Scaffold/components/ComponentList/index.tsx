import { PlusOutlined } from "@ant-design/icons";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel, } from "@util/robot";
import { Button, Menu, } from "antd";
import ScaffoldModel from "pages/Scaffold/ScaffoldModel";
import styles from './index.module.less';

const ComponentList: React.FC = () => {
  const [scaffoldModel, scaffoldUpdateAction] = useModel<ScaffoldModel>(ScaffoldModel.modelName);
  const [workbenchModel, workbenchUpdateAction] = useModel<WorkbenchModel>(WorkbenchModel.modelName);

  const componentList = scaffoldModel.scaffold.componentList.map((component) => {
    return {
      label: component.name,
      key: component.id,
      onClick: () => {
        if (workbenchModel.component.id === component.id) {
          return;
        }

        scaffoldModel.switchComponent(component.id, component.recentVersionId, true);
      }
    };
  });

  const showComponentAdd = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    scaffoldUpdateAction(() => scaffoldModel.showComponentAddModal = true);
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