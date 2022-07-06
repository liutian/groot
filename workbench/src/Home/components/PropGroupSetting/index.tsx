import { useModel } from "@util/robot";
import { Form, Input, Modal, Radio } from "antd";
import React, { useEffect, useRef } from "react";
import StudioModel from '@model/StudioModel';
import { propKeyRule } from "@util/utils";

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

  return (<Modal mask={false} width={400} title="配置组" confirmLoading={studioModel.settingModalLoading}
    visible={!!studioModel.currSettingPropGroup} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item name="name" label="名称" rules={[{ required: true }]}>
        <Input ref={inputRef} />
      </Form.Item>
      <Form.Item name="struct" label="结构" rules={[{ required: true }]}>
        <Radio.Group disabled={!!studioModel.currSettingPropGroup?.id}>
          <Radio value="Default">默认</Radio>
          <Radio value="List">列表</Radio>
          <Radio value="Item">配置项</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.struct !== currentValues.struct}
      >
        {({ getFieldValue }) => {
          const required = getFieldValue('struct') === 'List';
          const rules = [{ required }, { pattern: propKeyRule, message: '格式错误，必须是标准js标识符' }];
          return (
            <Form.Item label="属性名" name="propKey" rules={rules}>
              <Input />
            </Form.Item>
          )
        }}
      </Form.Item>

    </Form>
  </Modal>)
}


export default PropGroupSetting;