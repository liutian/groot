import { Form, Input, Modal, Select } from "antd";
import { Release, useModel } from "@grootio/common";

import WorkbenchModel from "@model/WorkbenchModel";
import { ModalStatus } from "@util/common";
import InstanceModel from "pages/Instance/InstanceModel";

const ReleaseAddModal: React.FC = () => {
  const instanceModel = useModel(InstanceModel);
  const workbenchModel = useModel(WorkbenchModel);
  const [form] = Form.useForm();

  const handleOk = async () => {
    const formData = await form.validateFields();
    instanceModel.addRelease(formData as Release).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    instanceModel.releaseAddModalStatus = ModalStatus.None;
  }

  return <Modal open={instanceModel.releaseAddModalStatus !== ModalStatus.None} mask={false} title="新增迭代"
    confirmLoading={instanceModel.releaseAddModalStatus === ModalStatus.Submit}
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