import { PlusOutlined } from "@ant-design/icons";
import { ComponentParserType, ModalStatus, useRegisterModel } from "@grootio/common";
import { Button, Menu } from "antd";
import { grootCommandManager, grootStateManager } from "context";
import { useEffect } from "react";
import ComponentAddModal from "./ComponentAddModal";

import styles from './index.module.less'
import SolutionModel from "./SolutionModel";

export const Solution = () => {
  const solutionModel = useRegisterModel(SolutionModel)
  const [currComponent] = grootStateManager().useStateByName('gs.studio.component');
  const componentTypes = [
    {
      label: '组件',
      key: ComponentParserType.ReactComponent,
      children: solutionModel.componentList.map((component) => {
        return {
          label: component.name,
          key: component.id,
          onClick: () => {
            const currComponent = grootStateManager().getState('gs.studio.component')
            if (currComponent.id === component.id) {
              return;
            }

            grootCommandManager().executeCommand('gc.fetch.prototype', component.id, component.recentVersionId)
          }
        };
      })
    },
  ]

  useEffect(() => {
    solutionModel.loadList();
  }, [])


  const showComponentAdd = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    solutionModel.componentAddModalStatus = ModalStatus.Init
    e.stopPropagation();
  }

  const renderActions = () => {
    return <>
      <Button icon={<PlusOutlined />} type="link" onClick={showComponentAdd} />
    </>
  }

  if (!currComponent) {
    return null;
  }

  return <div className={styles.container}>
    <Menu mode="inline" openKeys={[ComponentParserType.ReactComponent.toString()]} className={styles.menu}
      expandIcon={renderActions()} selectedKeys={[`${currComponent.id}`]} items={componentTypes} />

    <ComponentAddModal />
  </div>

}