import { useModel } from "@util/robot";
import { Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import StudioModel from '@model/Studio';

const StudioBlockSetting: React.FC = () => {
  const [form] = Form.useForm();
  const [model, updateAction] = useModel<StudioModel>('studio');

  const handleOk = async () => {
    const blockFormData = await form.validateFields();
    model.updateOrAddStudioBlock(blockFormData);
  }

  const handleCancel = () => {
    updateAction(() => {
      model.currSettingStudioBlock = null;
      model.currGroupOfSettingStudioBlock = null;
    })
  }

  useEffect(() => {
    if (model.currSettingStudioBlock) {
      form.resetFields();
      form.setFieldsValue(model.currSettingStudioBlock);
    }
  }, [model.currSettingStudioBlock]);

  return (<Modal mask={false} width={400} title="配置块" visible={!!model.currSettingStudioBlock} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item name="title" label="名称" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="属性映射" name="propKey">
        <Input />
      </Form.Item>
    </Form>
  </Modal>)
}

export default StudioBlockSetting;