import { Form, Modal, Radio } from "antd";
import { EnvType, ModalStatus, useModel } from "@grootio/common";
import { useEffect } from "react";

import InstanceModel from "pages/Instance/InstanceModel";

const DeployModal: React.FC = () => {
  const instanceModel = useModel(InstanceModel);
  const [form] = Form.useForm();

  useEffect(() => {
    if (instanceModel.assetDeployModalStatus === ModalStatus.Init) {
      form.resetFields();
    }
  }, [instanceModel.assetDeployModalStatus])

  const onOk = async () => {
    const formData = await form.validateFields();
    instanceModel.assetDeploy(formData);
  }

  return <Modal open={instanceModel.assetDeployModalStatus !== ModalStatus.None} title="部署"
    confirmLoading={instanceModel.assetDeployModalStatus === ModalStatus.Submit} onOk={onOk}>
    <Form form={form} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
      <Form.Item label="环境" name="env" initialValue={EnvType.Dev}>
        <Radio.Group>
          <Radio.Button value={EnvType.Dev}>{EnvType.Dev}</Radio.Button>
          <Radio.Button value={EnvType.Qa}>{EnvType.Qa}</Radio.Button>
          <Radio.Button value={EnvType.Pl}>{EnvType.Pl}</Radio.Button>
          <Radio.Button value={EnvType.Ol}>{EnvType.Ol}</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Form>
  </Modal>
}

export default DeployModal;