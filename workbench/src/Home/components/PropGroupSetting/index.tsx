import { useModel } from "@util/robot";
import { Form, Input, Modal, Radio } from "antd";
import React, { useEffect, useRef } from "react";
import StudioModel from '@model/StudioModel';

const PropGroupSetting: React.FC = () => {
  const [form] = Form.useForm();
  const [studioModel, updateAction] = useModel<StudioModel>('studio');
  const inputRef = useRef<any>(null);

  const handleOk = async () => {
    const groupFormData = await form.validateFields();
    form.resetFields();
    studioModel.updateOrAddPropGroup(groupFormData);
  }

  const handleCancel = () => {
    updateAction(() => {
      studioModel.currSettingPropGroup = undefined;
    })
  }

  useEffect(() => {
    if (studioModel.currSettingPropGroup) {
      form.resetFields();
      form.setFieldsValue(studioModel.currSettingPropGroup);

      setTimeout(() => {
        inputRef.current.focus({ cursor: 'all' });
      }, 300)
    }
  }, [studioModel.currSettingPropGroup]);

  return (<Modal mask={false} width={400} title="配置组" visible={!!studioModel.currSettingPropGroup} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item name="name" label="名称" rules={[{ required: true }]}>
        <Input ref={inputRef} />
      </Form.Item>
      <Form.Item name="struct" label="结构" rules={[{ required: true }]}>
        <Radio.Group >
          <Radio value="Default">默认</Radio>
          <Radio value="List">列表</Radio>
          <Radio value="Map">键值对</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="属性映射" name="propKey">
        <Input />
      </Form.Item>
    </Form>
  </Modal>)
}


export default PropGroupSetting;