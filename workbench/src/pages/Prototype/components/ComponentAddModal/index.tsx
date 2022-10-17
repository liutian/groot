import { ComponentParserType } from "@grootio/common";
import { ModalStatus } from "@util/common";
import { useModel } from "@util/robot";
import { Form, Input, Modal } from "antd";
import PrototypeModel from "pages/Prototype/PrototypeModel";

const ComponentAddModal: React.FC = () => {
  const [prototypeModel, updateAction] = useModel(PrototypeModel);
  const [form] = Form.useForm();

  const handleOk = async () => {
    const formData = await form.validateFields();
    prototypeModel.addComponent(formData as Component).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    updateAction(() => {
      prototypeModel.componentAddModalStatus = ModalStatus.None;
    })
  }

  return <Modal visible={prototypeModel.componentAddModalStatus !== ModalStatus.None} mask={false} title="创建组件"
    confirmLoading={prototypeModel.componentAddModalStatus === ModalStatus.Submit}
    onOk={handleOk} onCancel={handleCancel} okText="创建">
    <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} >
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="解析器" name="parserType" rules={[{ required: true }]} initialValue={ComponentParserType.ReactComponent}>
        <Input disabled />
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