import { ComponentVersion, ModalStatus, useModel } from "@grootio/common";
import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import SolutionModel from "../SolutionModel";


const ComponentVersionAddModal: React.FC = () => {
  const [form] = Form.useForm();
  const solutionModelsol = useModel(SolutionModel)

  useEffect(() => {
    if (solutionModelsol.component) {
      form.setFieldValue('imageVersionId', solutionModelsol.component.componentVersion.id)
    }
  }, [solutionModelsol.componentVersionAddModalStatus])

  const handleOk = async () => {
    const formData = await form.validateFields();
    solutionModelsol.addComponentVersion(formData as ComponentVersion).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    solutionModelsol.componentVersionAddModalStatus = ModalStatus.None;
  }

  return <Modal open={solutionModelsol.componentVersionAddModalStatus !== ModalStatus.None} mask={false} title="创建版本"
    confirmLoading={solutionModelsol.componentVersionAddModalStatus === ModalStatus.Submit}
    onOk={handleOk} onCancel={handleCancel} okText="创建">
    <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="关联版本" name="imageVersionId" rules={[{ required: true }]} >
        <Select options={solutionModelsol.component?.versionList.map((item) => {
          return { label: item.name, value: item.id }
        })} />
      </Form.Item>
    </Form>
  </Modal>
}

export default ComponentVersionAddModal;