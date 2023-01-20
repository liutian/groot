import { Button, Menu } from "antd";
import { useState } from "react";
import { PluginViewComponent, useModel } from "@grootio/common";
import { PlusOutlined } from "@ant-design/icons";
import styles from './index.module.less';

const StateList: PluginViewComponent = ({ useModel, WorkbenchModel }) => {
  const workbenchModel = useModel(WorkbenchModel);
  const [openKeys, setOpenKeys] = useState(['global', 'page']);

  let globalStateList = [];
  let pageStateList = [];
  workbenchModel.stateList.forEach((data) => {
    const state = {
      label: data.name,
      key: data.id,
    };

    if (!data.componentInstance) {
      globalStateList.push(state)
    } else {
      pageStateList.push(state);
    }
  });

  const showInstanceAdd = (e: React.MouseEvent<HTMLElement, MouseEvent>, entry: boolean) => {

    e.stopPropagation();
  }

  const componentTypes = [
    { label: '全局', key: 'global', children: globalStateList },
    { label: '页面', key: 'page', children: pageStateList },
  ]

  const renderActions = (menuInfo: any) => {
    return <>
      <Button icon={<PlusOutlined />} type="link" onClick={(e) => {
        showInstanceAdd(e, menuInfo.eventKey === 'global');
      }} />
    </>
  }

  return <Menu mode="inline" onOpenChange={(openKeys) => setOpenKeys(openKeys)}
    openKeys={openKeys} className={styles.menuContainer} expandIcon={renderActions}
    selectedKeys={[`${workbenchModel.componentInstance?.id}`]} items={componentTypes} />

}

export default StateList;