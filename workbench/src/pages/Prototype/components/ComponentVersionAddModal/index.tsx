import WorkbenchModel from "@model/WorkbenchModel";
import { ModalStatus } from "@util/common";
import { useModel } from "@util/robot";
import { Form, Input, Modal, Select } from "antd";
import PrototypeModel from "pages/Prototype/PrototypeModel";

const ComponentVersionAddModal: React.FC = () => {
  const [prototypeModel, updateAction] = useModel(PrototypeModel);
  const [workbenchModel] = useModel(WorkbenchModel);
  const [form] = Form.useForm();

  const handleOk = async () => {
    const formData = await form.validateFields();
    prototypeModel.addComponentVersion(formData as ComponentVersion).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    updateAction(() => {
      prototypeModel.componentVersionAddModalStatus = ModalStatus.None;
    })
  }

  return <Modal visible={prototypeModel.componentVersionAddModalStatus !== ModalStatus.None} mask={false} title="创建版本"
    confirmLoading={prototypeModel.componentVersionAddModalStatus === ModalStatus.Submit}
    onOk={handleOk} onCancel={handleCancel} okText="创建">
    <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="关联版本" name="imageVersionId" rules={[{ required: true }]}>
        <Select>
          {
            workbenchModel.component?.versionList.map((version) => {
              return (<Select.Option key={version.id} value={version.id}>{version.name}</Select.Option>)
            })
          }
        </Select>
      </Form.Item>
    </Form>
  </Modal>
}

export default ComponentVersionAddModal;