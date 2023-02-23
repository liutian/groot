import { BranchesOutlined, CaretDownOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import { ComponentInstance, ModalStatus, useRegisterModel } from "@grootio/common";
import { Divider, Select, Space } from "antd";
import { grootCommandManager, grootStateManager } from "context";
import { useEffect } from "react";
import ApplicationModel from "./ApplicationModel";
import ComponentAddModal from "./InstanceAddModal";
import ComponentVersionAddModal from "./ReleaseAddModal";

import styles from './index.module.less'
import InstanceItem from "./InstanceItem";
import BuildModal from "./BuildModal";
import DeployModal from "./DeployModal";

export const Application = () => {
  const [currInstance] = grootStateManager().useStateByName('gs.studio.componentInstance');
  const applicationModel = useRegisterModel(ApplicationModel)
  const [release] = grootStateManager().useStateByName('gs.studio.release')

  useEffect(() => {
    if (currInstance) {
      applicationModel.loadList(release.id);
      applicationModel.loadReleaseList()
    }
  }, [currInstance])

  const switchInstance = (instance: ComponentInstance) => {
    grootCommandManager().executeCommand('gc.fetch.instance', instance.id)
  }

  if (!currInstance) {
    return null;
  }

  return <div className={styles.container}>
    <div>
      <div className={styles.componentItemHeader}>
        <div style={{ flexGrow: 1 }}>
          {
            applicationModel.releaseList && (
              <Select
                onChange={(e) => applicationModel.switchRelease(e)}
                value={release.id}
                suffixIcon={<CaretDownOutlined />}
                dropdownMatchSelectWidth={false}
                bordered={false}
                fieldNames={{ label: 'name', value: 'id' }}
                options={applicationModel.releaseList}
              />
            )
          }
        </div>

        <Space size="small">
          <SendOutlined onClick={() => {
            applicationModel.assetBuildModalStatus = ModalStatus.Init;
          }} />
          <BranchesOutlined onClick={() => {
            applicationModel.releaseAddModalStatus = ModalStatus.Init
          }} />
          <PlusOutlined onClick={() => {
            applicationModel.instanceAddModalStatus = ModalStatus.Init
          }} />
        </Space>
      </div>
      <div >
        {
          applicationModel.noEntryInstanceList.map((instance) => {
            return (<div key={instance.id}
              className={`${styles.componentItem} ${(currInstance.rootId || currInstance.id) === instance.id ? styles.active : ''}`}
              onClick={() => switchInstance(instance)}>
              <InstanceItem instance={instance} />
            </div>)
          })
        }
        <Divider style={{ margin: '0 0 5px 0' }} />
        {
          applicationModel.entryInstanceList.map((instance) => {
            return (<div key={instance.id}
              className={`${styles.componentItem} ${(currInstance.rootId || currInstance.id) === instance.id ? styles.active : ''}`}
              onClick={() => switchInstance(instance)}>
              <InstanceItem instance={instance} />
            </div>)
          })
        }
      </div>
    </div>


    <ComponentAddModal />
    <ComponentVersionAddModal />
    <BuildModal />
    <DeployModal />
  </div >

}