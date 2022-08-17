import { useModel } from "@util/robot";
import { Form, Input, Modal, Switch } from "antd";
import ScaffoldModel from "pages/Scaffold/ScaffoldModel";

const ComponentAddModal: React.FC = () => {
  const [scaffoldModel, updateAction] = useModel<ScaffoldModel>(ScaffoldModel.modelName);
  const [form] = Form.useForm();

  const handleOk = async () => {
    const formData = await form.validateFields();
    scaffoldModel.addComponent(formData as Component).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    updateAction(() => {
      scaffoldModel.showComponentAddModal = false;
    })
  }

  return <Modal visible={scaffoldModel.showComponentAddModal} mask={false} title="新增组件"
    confirmLoading={scaffoldModel.componentAddFetchLoading} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="是否是容器" name="container" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>

      <Form.Item label="组件名称" name="componentName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="组件包名" name="packageName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Form>
  </Modal>
}

export default ComponentAddModal;