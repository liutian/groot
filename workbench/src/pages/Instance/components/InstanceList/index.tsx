import { PlusOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import { useState } from "react";

import WorkbenchModel from "@model/WorkbenchModel";
import { ModalStatus } from "@util/common";
import InstanceModel from "pages/Instance/InstanceModel";

import styles from './index.module.less';
import { useModel } from "@grootio/common";

const InstanceList: React.FC = () => {
  const instanceModel = useModel(InstanceModel);
  const workbenchModel = useModel(WorkbenchModel);
  const [openKeys, setOpenKeys] = useState(['entry', 'no-entry']);

  let entryInstanceList = [];
  let noEntryInstanceList = [];
  workbenchModel.application.release.instanceList.forEach((componentInstance) => {
    const instance = {
      label: componentInstance.name,
      key: componentInstance.id,
      onClick: () => {
        if (workbenchModel.componentInstance.id === componentInstance.id) {
          return;
        }

        instanceModel.fetchRootInstance(componentInstance.id);
      }
    };

    if (componentInstance.entry) {
      entryInstanceList.push(instance)
    } else {
      noEntryInstanceList.push(instance);
    }
  });

  const showInstanceAdd = (e: React.MouseEvent<HTMLElement, MouseEvent>, entry: boolean) => {
    instanceModel.instanceAddModalStatus = ModalStatus.Init;
    instanceModel.instanceAddEntry = entry;
    e.stopPropagation();
  }

  const componentTypes = [
    { label: '主要', key: 'entry', children: entryInstanceList },
    { label: '其他', key: 'no-entry', children: noEntryInstanceList },
  ]

  const renderActions = (menuInfo: any) => {
    return <>
      <Button icon={<PlusOutlined />} type="link" onClick={(e) => {
        showInstanceAdd(e, menuInfo.eventKey === 'entry');
      }} />
    </>
  }

  return <Menu mode="inline" onOpenChange={(openKeys) => setOpenKeys(openKeys)} openKeys={openKeys} className={styles.menuContainer} expandIcon={renderActions} selectedKeys={[`${workbenchModel.componentInstance?.id}`]} items={componentTypes} />
}

export default InstanceList;