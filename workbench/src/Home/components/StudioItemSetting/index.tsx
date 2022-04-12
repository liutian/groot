import { useModel } from "@util/robot";
import { Form, Input, Modal, Select } from "antd";
import React, { useEffect } from "react";
import StudioModel from '@model/Studio';

const StudioItemSetting: React.FC = () => {
  const [form] = Form.useForm();
  const [model, updateAction] = useModel<StudioModel>('studio');

  const handleOk = async () => {
    const itemFormData = await form.validateFields();
    model.updateOrAddStudioItem(itemFormData);
  }

  const handleCancel = () => {
    updateAction(() => {
      model.currSettingStudioItem = null;
      model.currBlockOfSettingStudioItem = null;
    })
  }

  useEffect(() => {
    if (model.currSettingStudioItem) {
      form.resetFields();
      form.setFieldsValue(model.currSettingStudioItem);
    }
  }, [model.currSettingStudioItem]);

  return (<Modal mask={false} width={400} title="设置项" visible={!!model.currSettingStudioItem} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} labelAlign="left" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <Form.Item name="label" label="名称" required={true}>
        <Input />
      </Form.Item>
      <Form.Item label="类型" name="type" >
        <Select options={[
          { label: '文本', value: 'input' },
          { label: '日期', value: 'date-picker' }
        ]} />
      </Form.Item>
      <Form.Item label="属性映射" name="propKey">
        <Input />
      </Form.Item>
      <Form.Item label="默认值" name="defaultValue">
        <Input />
      </Form.Item>
    </Form>
  </Modal>)
}

export default StudioItemSetting;