import { useEffect, } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Menu, Tabs } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import styles from './index.module.less';
import { useRegisterModel } from "@util/robot";
import WorkbenchModel from "@model/WorkbenchModel";
import PropPersistModel from "@model/PropPersistModel";
import PropHandleModel from "@model/PropHandleModel";
import ScaffoldModel from "pages/Scaffold/ScaffoldModel";
import Workbench from "@components/Workbench";

const Scaffold: React.FC = () => {
  const [scaffoldModel] = useRegisterModel<ScaffoldModel>(ScaffoldModel.modelName, new ScaffoldModel());
  const [workbenchModel, workbenchUpdateAction] = useRegisterModel<WorkbenchModel>(WorkbenchModel.modelName, new WorkbenchModel());
  const [propHandleModel] = useRegisterModel<PropHandleModel>(PropHandleModel.modelName, new PropHandleModel());
  const [propPersistModel] = useRegisterModel<PropPersistModel>(PropPersistModel.modelName, new PropPersistModel());

  let [searchParams] = useSearchParams();

  useEffect(() => {
    propPersistModel.inject(workbenchModel, propHandleModel);
    scaffoldModel.inject(workbenchModel);
    workbenchModel.inject(propHandleModel);

    scaffoldModel.fetchScaffold(+searchParams.get('scaffoldId'));
  }, []);

  const renderList = () => {
    const componentList = scaffoldModel.scaffold.componentList.map((component) => {
      return {
        label: component.componentName,
        key: component.id,
        onClick: () => {
          if (workbenchModel.component.id === component.id) {
            return;
          }

          workbenchUpdateAction(() => {
            workbenchModel.currActiveTab = 'props';
          });
          scaffoldModel.switchComponent(component.id, component.recentVersionId);
        }
      };
    });

    const componentTypes = [
      { label: '组件', key: 'component', children: componentList },
      { label: '容器', key: 'container', children: [] },
    ]

    const renderActions = () => {
      return <>
        <Button icon={<PlusOutlined />} type="link" />
      </>
    }

    return <Tabs.TabPane key="scaffold" tab="脚手架">
      <Menu mode="inline" className={styles.menuContainer} expandIcon={renderActions()} selectedKeys={[`${workbenchModel.component.id}`]} items={componentTypes} />
    </Tabs.TabPane>
  }

  if (scaffoldModel.scaffold === undefined) {
    return <>loading</>
  } else if (scaffoldModel.scaffold === null) {
    return <>notfound component</>
  } else if (!workbenchModel.component) {
    return <>loading component</>
  } else {
    return (<Workbench extraTabPanes={renderList()} />);
  }
}

export default Scaffold;