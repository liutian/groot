import { Button, Modal } from "antd";

import InstanceModel from "pages/Instance/InstanceModel";
import { ModalStatus, useModel } from "@grootio/common";

const BuildModal: React.FC = () => {
  const instanceModel = useModel(InstanceModel);

  const onCancel = () => {
    instanceModel.assetBuildModalStatus = ModalStatus.None
  }

  let actions = [
    <Button key="primary" onClick={() => instanceModel.assetBuild()} type="primary" loading={instanceModel.assetBuildStatus === 'building'}>构建</Button>,
    <Button key="cancel" onClick={onCancel}>取消</Button>,
  ]

  if (instanceModel.assetBuildStatus === 'approve') {
    actions = [
      <Button key="primary" type="primary">查看审批</Button>,
      <Button key="cancel" onClick={onCancel}>取消</Button>,
    ]
  } else if (instanceModel.assetBuildStatus === 'buildOver') {
    actions = [
      <Button key="primary" onClick={() => {
        instanceModel.assetBuildModalStatus = ModalStatus.None;
        instanceModel.assetDeployModalStatus = ModalStatus.Init;
        instanceModel.assetBuildStatus = 'init';
      }} type="primary">前往部署</Button>,
      <Button key="cancel" onClick={onCancel}>取消</Button>,
    ]
  }

  return <Modal open={instanceModel.assetBuildModalStatus !== ModalStatus.None} onCancel={onCancel} title="构建" footer={[actions]}>
    {
      instanceModel.assetBuildStatus === 'init' && (
        <div>
          分析中...
        </div>
      )
    }

    {
      instanceModel.assetBuildStatus === 'analyseOver' && (
        <div>分析结果：</div>
      )
    }

    {
      instanceModel.assetBuildStatus === 'building' && (
        <div>
          构建中...
        </div>
      )
    }

    {
      instanceModel.assetBuildStatus === 'buildOver' && (
        <div>
          构建完成
        </div>
      )
    }

    {
      instanceModel.assetBuildStatus === 'approve' && (
        <div>
          构建完成，需要审批
        </div>
      )
    }
  </Modal>
}

export default BuildModal;