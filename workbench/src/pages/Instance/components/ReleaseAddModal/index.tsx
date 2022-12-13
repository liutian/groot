import { Form, Input, Modal, Select } from "antd";
import { Release } from "@grootio/common";

import WorkbenchModel from "@model/WorkbenchModel";
import { ModalStatus } from "@util/common";
import { useModel } from "@util/robot";
import EditorModel from "pages/Instance/InstanceModel";

const ReleaseAddModal: React.FC = () => {
  const [editorModel, updateAction] = useModel(EditorModel);
  const [workbenchModel] = useModel(WorkbenchModel);
  const [form] = Form.useForm();

  const handleOk = async () => {
    const formData = await form.validateFields();
    editorModel.addRelease(formData as Release).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    updateAction(() => {
      editorModel.releaseAddModalStatus = ModalStatus.None;
    })
  }

  return <Modal open={editorModel.releaseAddModalStatus !== ModalStatus.None} mask={false} title="新增迭代"
    confirmLoading={editorModel.releaseAddModalStatus === ModalStatus.Submit}
    onOk={handleOk} onCancel={handleCancel} okText="新增">
    <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="克隆" name="imageReleaseId" >
        <Select>
          {
            workbenchModel.application.releaseList.map((release) => {
              return <Select.Option key={release.id} value={release.id}>{release.name}</Select.Option>
            })
          }
        </Select>
      </Form.Item>

    </Form>
  </Modal>
}

export default ReleaseAddModal;