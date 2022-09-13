import { EnvType } from "@grootio/common";
import { useModel } from "@util/robot";
import { Button, Form, Input, Modal, Radio } from "antd"
import { useForm } from "antd/lib/form/Form";
import EditorModel from "pages/Editor/EditorModel";
import { useEffect } from "react";

const DeployModal: React.FC = () => {
  const [editorModel] = useModel<EditorModel>(EditorModel.modelName);
  const [form] = useForm();

  useEffect(() => {
    if (editorModel.showAssetDeployModal) {
      form.resetFields();
    }
  }, [editorModel.showAssetDeployModal])

  const onOk = async () => {
    const formData = await form.validateFields();
    editorModel.assetDeploy(formData);
  }

  return <Modal visible={editorModel.showAssetDeployModal} title="部署"
    confirmLoading={editorModel.assetDeployFetchLoading} onOk={onOk}>
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