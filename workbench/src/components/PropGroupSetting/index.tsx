import { useModel } from "@util/robot";
import { Form, Input, Modal, Radio } from "antd";
import React, { useEffect, useRef } from "react";

import { propKeyRule } from "@util/utils";
import PropPersistModel from "@model/PropPersistModel";

const PropGroupSetting: React.FC = () => {
  const [propPersistModel, propPersistAction] = useModel(PropPersistModel);
  const [form] = Form.useForm();
  const inputRef = useRef<any>(null);

  const handleOk = async () => {
    const groupFormData = await form.validateFields();
    propPersistModel.updateOrAddPropGroup(groupFormData);
  }

  const handleCancel = () => {
    propPersistAction(() => {
      propPersistModel.currSettingPropGroup = undefined;
    })
  }

  useEffect(() => {
    if (propPersistModel.currSettingPropGroup) {
      form.resetFields();
      form.setFieldsValue(propPersistModel.currSettingPropGroup);

      setTimeout(() => {
        inputRef.current.focus({ cursor: 'all' });
      }, 300)
    }
  }, [propPersistModel.currSettingPropGroup]);

  return (<Modal mask={false} width={400} title={propPersistModel.currSettingPropGroup?.id ? '更新配置组' : '创建配置组'}
    confirmLoading={propPersistModel.settingModalSubmitting} okText={propPersistModel.currSettingPropGroup?.id ? '更新' : '创建'}
    visible={!!propPersistModel.currSettingPropGroup} onOk={handleOk} onCancel={handleCancel}>
    {
      !!propPersistModel.currSettingPropGroup && (

        <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input ref={inputRef} />
          </Form.Item>
          <Form.Item name="struct" label="结构" rules={[{ required: true }]} initialValue="default">
            <Radio.Group disabled={!!propPersistModel.currSettingPropGroup.id}>
              <Radio value="default">层级</Radio>
              <Radio value="flat">平铺</Radio>
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
      )
    }
  </Modal>)
}


export default PropGroupSetting;