import { useModel } from "@util/robot";
import { Form, Input, Modal, Radio, Select, Space, Switch, Typography } from "antd";
import React, { useEffect } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import PropPersistModel from "@model/PropPersistModel";
import { PropItemType } from "@grootio/common";

const typeList = [
  { label: '文本', value: PropItemType.TEXT },
  { label: '多行文本', value: PropItemType.TEXTAREA },
  { label: '数字', value: PropItemType.NUMBER },
  { label: '滑块', value: PropItemType.SLIDER },
  { label: '按钮组', value: PropItemType.BUTTON_GROUP },
  { label: '开关', value: PropItemType.SWITCH },
  { label: '下拉框', value: PropItemType.SELECT },
  { label: '多选', value: PropItemType.CHECKBOX },
  { label: '单选', value: PropItemType.RADIO },
  { label: '日期', value: PropItemType.DATE_PICKER },
  { label: '时间', value: PropItemType.TIME_PICKER },
  { label: '列表', value: PropItemType.LIST },
  { label: '配置项', value: PropItemType.ITEM },
  { label: '层级', value: PropItemType.HIERARCHY },
  { label: 'json', value: PropItemType.JSON },
  { label: '函数', value: PropItemType.FUNCTION },
];

const PropItemSetting: React.FC = () => {
  const [propPersistModel, propPersistAction] = useModel<PropPersistModel>(PropPersistModel.modelName);

  const [form] = Form.useForm<PropItem>();

  const handleOk = async () => {
    const itemFormData = await form.validateFields();
    form.resetFields();
    propPersistModel.updateOrAddPropItem(itemFormData);
  }

  const handleCancel = () => {
    propPersistAction(() => {
      propPersistModel.currSettingPropItem = undefined;
    })
  }

  useEffect(() => {
    if (propPersistModel.currSettingPropItem) {
      form.resetFields();
      form.setFieldsValue(propPersistModel.currSettingPropItem);
    }
  }, [propPersistModel.currSettingPropItem]);

  const renderSelectFormItem = () => {
    return (
      <Form.Item label="选项" >
        <Form.List name="optionList" initialValue={[{}]} >
          {(fields, { add, remove }) => {
            return <>
              {fields.map(({ key, name, ...restField }, index) => {
                return <Space key={key} align="baseline">
                  <Form.Item name={[name, 'label']} {...restField} rules={[{ required: true }]}>
                    <Input placeholder="请输入名称" />
                  </Form.Item>
                  <Form.Item name={[name, 'value']} {...restField} rules={[{ required: true }]}>
                    <Input placeholder="请输入数据" />
                  </Form.Item>

                  <Form.Item noStyle dependencies={['type']}>
                    {() => {
                      const type = form.getFieldValue('type');
                      return type === 'Button_Group' ? <Form.Item name={[name, 'title']} {...restField} >
                        <Input placeholder="请输入描述" />
                      </Form.Item> : null;
                    }}
                  </Form.Item>

                  <Form.Item noStyle dependencies={['type']}>
                    {() => {
                      const type = form.getFieldValue('type');
                      return type === 'Button_Group' ? <Form.Item name={[name, 'icon']} {...restField} >
                        <Input placeholder="请输入图标" />
                      </Form.Item> : null;
                    }}
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

  return (<Modal mask={false} destroyOnClose width={600} title="配置项" confirmLoading={propPersistModel.settingModalLoading}
    visible={!!propPersistModel.currSettingPropItem} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} labelAlign="right" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} >
      <Form.Item name="label" label="名称" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="类型" name="type" rules={[{ required: true }]}>
        <Select disabled={!!propPersistModel.currSettingPropItem?.id} options={typeList} />
      </Form.Item>
      <Form.Item label="属性名" rules={[{ required: true }]} name="propKey">
        <Input />
      </Form.Item>
      <Form.Item valuePropName="checked" label="根属性" name="rootPropKey">
        <Switch />
      </Form.Item>

      {
        propPersistModel.currSettingPropItem?.span !== -1 && (
          <Form.Item label="宽度" name="span">
            <Radio.Group >
              <Radio value={12}>半行</Radio>
              <Radio value={24}>整行</Radio>
            </Radio.Group>
          </Form.Item>)
      }


      <Form.Item dependencies={['type']} noStyle >
        {({ getFieldValue }) => {
          const type = getFieldValue('type');
          const hasOption = ['Select', 'Radio', 'Checkbox', 'Button_Group'].includes(type);

          return hasOption ? renderSelectFormItem() : null
        }}
      </Form.Item>
    </Form>
  </Modal>)
}

export default PropItemSetting;