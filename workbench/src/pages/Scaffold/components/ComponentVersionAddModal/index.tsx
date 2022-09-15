import WorkbenchModel from "@model/WorkbenchModel";
import { ModalStatus } from "@util/common";
import { useModel } from "@util/robot";
import { Form, Input, Modal, Select } from "antd";
import ScaffoldModel from "pages/Scaffold/ScaffoldModel";

const ComponentVersionAddModal: React.FC = () => {
  const [scaffoldModel, updateAction] = useModel<ScaffoldModel>(ScaffoldModel.modelName);
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
  const [form] = Form.useForm();

  const handleOk = async () => {
    const formData = await form.validateFields();
    scaffoldModel.addComponentVersion(formData as ComponentVersion).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    updateAction(() => {
      scaffoldModel.componentVersionAddModalStatus = ModalStatus.None;
    })
  }

  return <Modal visible={scaffoldModel.componentVersionAddModalStatus !== ModalStatus.None} mask={false} title="新增版本"
    confirmLoading={scaffoldModel.componentVersionAddModalStatus === ModalStatus.Submit} onOk={handleOk} onCancel={handleCancel}>
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