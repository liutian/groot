import { Form, Input, Modal, Radio, Select, Space, Switch, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { PropItem, PropItemType, PropItemTypeNameMap, useModel } from "@grootio/common";
import PropPersistModel from "../PropPersistModel";
import { grootStateManager } from "context";
import { RemotePluginKeySep } from "util/utils";


const PropItemSetting: React.FC = () => {
  const propPersistModel = useModel(PropPersistModel);
  const [propSettingView] = grootStateManager().useStateByName('gs.studio.propSettingView', []);
  const [propItemTypeOptions] = useState(() => {
    if (propSettingView.length) {
      return [
        ...PropItemTypeNameMap,
        { name: '自定义', key: PropItemType.Extension },
      ]
    }

    return [...PropItemTypeNameMap];
  })

  const [form] = Form.useForm<PropItem>();

  const handleOk = async () => {
    const itemFormData = await form.validateFields();
    propPersistModel.updateOrAddPropItem(itemFormData);
  }

  const handleCancel = () => {
    propPersistModel.currSettingPropItem = undefined;
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

  return (<Modal mask={false} destroyOnClose width={600} title={propPersistModel.currSettingPropItem?.id ? '更新配置项' : '创建配置项'}
    confirmLoading={propPersistModel.settingModalSubmitting} open={!!propPersistModel.currSettingPropItem}
    onOk={handleOk} onCancel={handleCancel} okText={propPersistModel.currSettingPropItem?.id ? '更新' : '创建'}>
    {
      !!propPersistModel.currSettingPropItem && (

        <Form form={form} colon={false} labelAlign="right" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} >
          <Form.Item name="label" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="类型" name="type" rules={[{ required: true }]} >
            <Select options={propItemTypeOptions} fieldNames={{ label: 'name', value: 'key' }} />
          </Form.Item>
          <Form.Item noStyle dependencies={['type']}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');

              if (type === PropItemType.Extension) {
                const options = propSettingView.map((item) => {
                  return { name: item.name, key: `${item.packageName}${RemotePluginKeySep}${item.module}` }
                })

                return (<Form.Item label="子类型" name="subType" rules={[{ required: true }]} >
                  <Select options={options} fieldNames={{ label: 'name', value: 'key' }} />
                </Form.Item>)
              } else {
                return null;
              }
            }}
          </Form.Item>

          <Form.Item label="属性名" rules={[{ required: true }]} name="propKey">
            <Input />
          </Form.Item>
          <Form.Item valuePropName="checked" label="根属性" name="rootPropKey">
            <Switch />
          </Form.Item>

          {
            propPersistModel.currSettingPropItem.span !== -1 && (
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
              const hasOption = ([PropItemType.Select, PropItemType.Radio, PropItemType.Checkbox, PropItemType.ButtonGroup]).includes(type);

              return hasOption ? renderSelectFormItem() : null
            }}
          </Form.Item>
        </Form>
      )
    }
  </Modal>)
}

export default PropItemSetting;