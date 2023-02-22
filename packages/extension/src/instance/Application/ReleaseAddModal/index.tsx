import { APIPath, ModalStatus, Release, useModel } from "@grootio/common";
import { Form, Input, Modal, Select } from "antd";
import { getContext } from "context";
import { useEffect } from "react";
import ApplicationModel from "../ApplicationModel";


const ReleaseAddModal: React.FC = () => {
  const [form] = Form.useForm();
  const applicationModel = useModel(ApplicationModel);

  useEffect(() => {
    if (applicationModel.releaseAddModalStatus === ModalStatus.Init) {
      form.resetFields();
    }
  }, [applicationModel.instanceAddModalStatus]);

  const handleOk = async () => {
    const formData = await form.validateFields();
    applicationModel.addRelease(formData as Release)
  }

  const handleCancel = () => {
    applicationModel.releaseAddModalStatus = ModalStatus.None;
  }

  return <Modal open={applicationModel.releaseAddModalStatus !== ModalStatus.None} mask={false} title="新增迭代"
    confirmLoading={applicationModel.releaseAddModalStatus === ModalStatus.Submit}
    onOk={handleOk} onCancel={handleCancel} okText="新增">
    <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="克隆" name="imageReleaseId" >
        <Select>
          {
            applicationModel.releaseList.map((release) => {
              return <Select.Option key={release.id} value={release.id}>{release.name}</Select.Option>
            })
          }
        </Select>
      </Form.Item>

    </Form>
  </Modal>
}

export default ReleaseAddModal;