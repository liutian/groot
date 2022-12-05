import { ComponentSlot } from "@grootio/react";
import { Button, DatePicker, Divider, Form, Input, Select } from "antd";
import MultiDetailManager from "components/MultiDetailManager";

import styles from './index.module.less';

export const InputFormItem = ({ label, name, required }) => {
  return <Form.Item label={label} name={name} required={required} rules={[{ required }]}>
    <Input />
  </Form.Item>
}

export const SelectFormItem = ({ label, name, required, options }) => {
  return <Form.Item label={label} name={name} required={required} rules={[{ required }]}>
    <Select options={options} />
  </Form.Item>
}

export const DateFormItem = ({ label, name, required }) => {
  return <Form.Item label={label} name={name} required={required} rules={[{ required }]}>
    <DatePicker />
  </Form.Item>
}

export const PhoneFormItem = ({ label, name, required }) => {
  return <Form.Item label={label} name={name} required={required} rules={[{ required }, { pattern: /\d+/ }]}>
    <Input />
  </Form.Item >
}

export const EmailFormItem = ({ label, name, required }) => {
  return <Form.Item label={label} name={name} required={required} rules={[{ required }, { pattern: /\.com$/ }]}>
    <Input />
  </Form.Item >
}


export const MultiDetailFormItem = ({ name, children, _groot }) => {
  return <Form.Item name={name}>
    <MultiDetailManager _groot={_groot} children={children} />
  </Form.Item>
}

export const FormContainer = ({ children, title }) => {
  const [form] = Form.useForm();

  const submit = () => {
    form.validateFields().then((values) => {
      console.log(values);
      alert('提交成功')
    }).catch(() => {
      alert('校验失败')
    })
  }

  return <div className={styles.container}>
    <h3 className={styles.topBar} >
      {title}
      <Divider style={{ margin: 0 }} />
    </h3>
    <Form form={form} style={{ padding: '0 10px' }}>
      <ComponentSlot children={children} />
    </Form>

    <div className={styles.actionBar} style={{ padding: '0 10px' }}>
      <Button onClick={submit} style={{ width: '100%' }} type="primary">提交审批</Button>
    </div>

  </div>
}