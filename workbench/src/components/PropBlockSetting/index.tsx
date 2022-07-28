import PropPersistModel from "@model/PropPersistModel";
import { useModel } from "@util/robot";
import { Form, Input, Modal, Radio, Switch } from "antd";
import React, { useEffect, useRef } from "react";

const PropBlockSetting: React.FC = () => {
  const [propPersistModel, updateAction] = useModel<PropPersistModel>(PropPersistModel.modelName);
  const [form] = Form.useForm();
  const inputRef = useRef<any>(null);

  const handleOk = async () => {
    const blockFormData = await form.validateFields();
    form.resetFields();
    propPersistModel.updateOrAddPropBlock(blockFormData);
  }

  const handleCancel = () => {
    updateAction(() => {
      propPersistModel.currSettingPropBlock = undefined;
    })
  }

  useEffect(() => {
    if (propPersistModel.currSettingPropBlock) {
      form.resetFields();
      form.setFieldsValue(propPersistModel.currSettingPropBlock);

      setTimeout(() => {
        inputRef.current.focus({ cursor: 'all' });
      }, 300)
    }
  }, [propPersistModel.currSettingPropBlock]);

  return (<Modal mask={false} width={400} title="配置块" confirmLoading={propPersistModel.settingModalLoading}
    visible={!!propPersistModel.currSettingPropBlock} onOk={handleOk} onCancel={handleCancel}>
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
      <Form.Item label="布局" name="layout" initialValue="horizontal">
        <Radio.Group >
          <Radio value="horizontal">水平</Radio>
          <Radio value="vertical">垂直</Radio>
        </Radio.Group>
      </Form.Item>
    </Form>
  </Modal>)
}

export default PropBlockSetting;