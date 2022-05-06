import { useModel } from "@util/robot";
import { Form, Input, Modal } from "antd";
import React, { useEffect, useRef } from "react";
import StudioModel from '@model/Studio';

const StudioGroupSetting: React.FC = () => {
  const [form] = Form.useForm();
  const [model, updateAction] = useModel<StudioModel>('studio');
  const inputRef = useRef<any>(null);

  const handleOk = async () => {
    const groupFormData = await form.validateFields();
    form.resetFields();
    model.updateOrAddStudioGroup(groupFormData);
  }

  const handleCancel = () => {
    updateAction(() => {
      model.currSettingStudioGroup = undefined;
    })
  }

  useEffect(() => {
    if (model.currSettingStudioGroup) {
      form.resetFields();
      form.setFieldsValue(model.currSettingStudioGroup);

      setTimeout(() => {
        inputRef.current.focus({ cursor: 'all' });
      }, 300)
    }
  }, [model.currSettingStudioGroup]);

  return (<Modal mask={false} width={400} title="配置组" visible={!!model.currSettingStudioGroup} onOk={handleOk} onCancel={handleCancel}>
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


export default StudioGroupSetting;