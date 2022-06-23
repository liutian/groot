import { useModel } from "@util/robot";
import { Form, Input, Modal, Radio, Select, Space, Typography } from "antd";
import React, { useEffect } from "react";
import StudioModel from '@model/StudioModel';
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const PropItemSetting: React.FC = () => {
  const [form] = Form.useForm<PropItem>();
  const [model, updateAction] = useModel<StudioModel>('studio');

  const handleOk = async () => {
    const itemFormData = await form.validateFields();
    form.resetFields();
    model.updateOrAddPropItem(itemFormData);
  }

  const handleCancel = () => {
    updateAction(() => {
      model.currSettingPropItem = undefined;
    })
  }

  useEffect(() => {
    if (model.currSettingPropItem) {
      form.resetFields();
      form.setFieldsValue(model.currSettingPropItem);
    }
  }, [model.currSettingPropItem]);

  const renderSelectFormItem = () => {
    return (
      <Form.Item label="选项" >
        <Form.List name="optionList" initialValue={[{}]} >
          {(fields, { add, remove }) => {
            return <>
              {fields.map(({ key, name, ...restField }, index) => {
                return <Space key={key} align="baseline">
                  <Form.Item name={[name, 'label']} {...restField} rules={[{ required: true }]}>
                    <Input placeholder="请输入标签" />
                  </Form.Item>
                  :
                  <Form.Item name={[name, 'value']} {...restField} rules={[{ required: true }]}>
                    <Input placeholder="请输入数据" />
                  </Form.Item>
                  <Typography.Link onClick={() => add({ label: '', value: '' }, index + 1)}>
                    <PlusOutlined />
                  </Typography.Link>
                  <Typography.Link disabled={fields.length === 1} onClick={() => remove(name)}>
                    <DeleteOutlined />
                  </Typography.Link>
                </Space>
              })}
            </>
          }}
        </Form.List>
      </Form.Item>
    )
  }

  return (<Modal mask={false} destroyOnClose width={450} title="配置项" visible={!!model.currSettingPropItem} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} labelAlign="right" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} >
      <Form.Item name="label" label="名称" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="类型" name="type" rules={[{ required: true }]}>
        <Select disabled={!!model.currSettingPropItem?.id} options={[
          { label: '文本', value: 'input' },
          { label: '日期', value: 'date-picker' },
          { label: '开关', value: 'switch' },
          { label: '下拉框', value: 'select' },
          { label: '多选', value: 'checkbox' },
          { label: '单选', value: 'radio' },
          { label: '列表', value: 'list' },
          { label: '键值对', value: 'map' }
        ]} />
      </Form.Item>
      <Form.Item label="属性映射" rules={[{ required: true }]} name="propKey">
        <Input />
      </Form.Item>
      <Form.Item label="宽度" name="span">
        <Radio.Group >
          <Radio value={12}>一半</Radio>
          <Radio value={24}>整行</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item dependencies={['type']} noStyle >
        {({ getFieldValue }) => {
          const type = getFieldValue('type');
          const hasOption = ['select', 'radio', 'checkbox'].includes(type);

          return hasOption ? renderSelectFormItem() : null
        }}
      </Form.Item>
    </Form>
  </Modal>)
}

export default PropItemSetting;