import { useModel } from "@util/robot";
import { Form, Input, Modal } from "antd";
import React, { useEffect, useRef } from "react";
import StudioModel from '@model/StudioModel';

const PropGroupSetting: React.FC = () => {
  const [form] = Form.useForm();
  const [model, updateAction] = useModel<StudioModel>('studio');
  const inputRef = useRef<any>(null);

  const handleOk = async () => {
    const groupFormData = await form.validateFields();
    form.resetFields();
    model.updateOrAddPropGroup(groupFormData);
  }

  const handleCancel = () => {
    updateAction(() => {
      model.currSettingPropGroup = undefined;
    })
  }

  useEffect(() => {
    if (model.currSettingPropGroup) {
      form.resetFields();
      form.setFieldsValue(model.currSettingPropGroup);

      setTimeout(() => {
        inputRef.current.focus({ cursor: 'all' });
      }, 300)
    }
  }, [model.currSettingPropGroup]);

  return (<Modal mask={false} width={400} title="配置组" visible={!!model.currSettingPropGroup} onOk={handleOk} onCancel={handleCancel}>
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


export default PropGroupSetting;