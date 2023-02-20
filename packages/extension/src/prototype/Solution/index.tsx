import { PlusOutlined } from "@ant-design/icons";
import { APIPath, ComponentParserType } from "@grootio/common";
import { Button, Menu } from "antd";
import { getContext, grootCommandManager, grootStateManager } from "context";
import { useEffect, useState } from "react";

import styles from './index.module.less'

export const Solution = () => {

  const [currComponent] = grootStateManager().useStateByName('gs.studio.component');
  const [componentList, setComponentList] = useState([]);
  const componentTypes = [
    { label: '组件', key: ComponentParserType.ReactComponent, children: componentList },
  ]

  useEffect(() => {
    getContext().request(APIPath.solution_component_list).then(({ data }) => {
      const list = data.map((component) => {
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
      });
      setComponentList(list)
    })
  }, [])


  const showComponentAdd = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    // prototypeModel.componentAddModalStatus = ModalStatus.Init
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

  return <Menu mode="inline" openKeys={[ComponentParserType.ReactComponent.toString()]} className={styles.menuContainer}
    expandIcon={renderActions()} selectedKeys={[`${currComponent.id}`]} items={componentTypes} />
}