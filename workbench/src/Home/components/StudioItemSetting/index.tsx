import { useModel } from "@util/robot";
import { Form, Input, Modal, Radio, Select } from "antd";
import React, { useEffect } from "react";
import StudioModel from '@model/Studio';

const StudioItemSetting: React.FC = () => {
  const [form] = Form.useForm<CodeMetaStudioPropItem>();
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

  return (<Modal mask={false} width={450} title="配置项" visible={!!model.currSettingStudioItem} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} labelAlign="right" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item name="label" label="名称" required={true}>
        <Input />
      </Form.Item>
      <Form.Item label="类型" name="type" required={true}>
        <Select options={[
          { label: '文本', value: 'input' },
          { label: '日期', value: 'date-picker' },
          { label: '布尔', value: 'boolean' }
        ]} />
      </Form.Item>
      <Form.Item label="属性映射" required={true} name="propKey">
        <Input />
      </Form.Item>
      <Form.Item label="宽度" name="span">
        <Radio.Group >
          <Radio value={12}>一半</Radio>
          <Radio value={24}>整行</Radio>
        </Radio.Group>
      </Form.Item>
    </Form>
  </Modal>)
}

export default StudioItemSetting;