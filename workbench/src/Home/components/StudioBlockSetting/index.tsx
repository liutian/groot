import { useModel } from "@util/robot";
import { Form, Input, Modal } from "antd";
import React, { useEffect, useRef } from "react";
import StudioModel from '@model/Studio';

const StudioBlockSetting: React.FC = () => {
  const [form] = Form.useForm();
  const [model, updateAction] = useModel<StudioModel>('studio');
  const inputRef = useRef<any>(null);

  const handleOk = async () => {
    const blockFormData = await form.validateFields();
    form.resetFields();
    model.updateOrAddStudioBlock(blockFormData);
  }

  const handleCancel = () => {
    updateAction(() => {
      model.currSettingStudioBlock = undefined;
    })
  }

  useEffect(() => {
    if (model.currSettingStudioBlock) {
      form.resetFields();
      form.setFieldsValue(model.currSettingStudioBlock);

      setTimeout(() => {
        inputRef.current.focus({ cursor: 'all' });
      }, 300)
    }
  }, [model.currSettingStudioBlock]);

  return (<Modal mask={false} width={400} title="配置块" visible={!!model.currSettingStudioBlock} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item name="name" label="名称" rules={[{ required: true }]}>
        <Input ref={inputRef} />
      </Form.Item>
      <Form.Item label="属性映射" name="propKey">
        <Input />
      </Form.Item>
    </Form>
  </Modal>)
}

export default StudioBlockSetting;