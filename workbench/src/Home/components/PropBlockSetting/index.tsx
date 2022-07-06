import { useModel } from "@util/robot";
import { Form, Input, Modal, Switch } from "antd";
import React, { useEffect, useRef } from "react";
import StudioModel from '@model/StudioModel';

const PropBlockSetting: React.FC = () => {
  const [form] = Form.useForm();
  const [studioModel, updateAction] = useModel<StudioModel>('studio');
  const inputRef = useRef<any>(null);

  const handleOk = async () => {
    const blockFormData = await form.validateFields();
    form.resetFields();
    studioModel.updateOrAddPropBlock(blockFormData);
  }

  const handleCancel = () => {
    updateAction(() => {
      studioModel.currSettingPropBlock = undefined;
    })
  }

  useEffect(() => {
    if (studioModel.currSettingPropBlock) {
      form.resetFields();
      form.setFieldsValue(studioModel.currSettingPropBlock);

      setTimeout(() => {
        inputRef.current.focus({ cursor: 'all' });
      }, 300)
    }
  }, [studioModel.currSettingPropBlock]);

  return (<Modal mask={false} width={400} title="配置块" confirmLoading={studioModel.settingModalLoading}
    visible={!!studioModel.currSettingPropBlock} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item name="name" label="名称" rules={[{ required: true }]}>
        <Input ref={inputRef} />
      </Form.Item>
      <Form.Item label="属性名" name="propKey">
        <Input />
      </Form.Item>
      <Form.Item valuePropName="checked" label="根属性" name="rootPropKey">
        <Switch />
      </Form.Item>
    </Form>
  </Modal>)
}

export default PropBlockSetting;