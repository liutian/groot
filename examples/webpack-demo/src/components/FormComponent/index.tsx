import { ComponentSlot } from "@grootio/react-parser";
import { Affix, Button, DatePicker, Divider, Form, Input, Select } from "antd";

import styles from './index.module.less';

export const InputForm = ({ label, name, required }) => {
  return <Form.Item label={label} name={name} required={required} rules={[{ required }]}>
    <Input />
  </Form.Item>
}

export const SelectForm = ({ label, name, required, options }) => {
  return <Form.Item label={label} name={name} required={required} rules={[{ required }]}>
    <Select options={options} />
  </Form.Item>
}

export const DateForm = ({ label, name, required }) => {
  return <Form.Item label={label} name={name} required={required} rules={[{ required }]}>
    <DatePicker />
  </Form.Item>
}

export const PhoneForm = ({ label, name, required }) => {
  return <Form.Item label={label} name={name} required={required} rules={[{ required }, { pattern: /\d+/ }]}>
    <Input />
  </Form.Item >
}

export const EmailForm = ({ label, name, required }) => {
  return <Form.Item label={label} name={name} required={required} rules={[{ required }, { pattern: /\.com$/ }]}>
    <Input />
  </Form.Item >
}

export const FormContainer = ({ children, title }) => {
  const [form] = Form.useForm();

  const submit = () => {
    form.validateFields().then(() => {
      alert('提交成功')
    }).catch(() => {
      alert('校验失败')
    })
  }

  return <div className={styles.container}>
    <Affix>
      <h3 style={{ textAlign: 'center', verticalAlign: 'middle', lineHeight: '40px' }}>
        {title}
        <Divider style={{ margin: 0 }} />
      </h3>
    </Affix>
    <Form form={form} style={{ padding: '0 10px' }}>
      <ComponentSlot children={children} />
    </Form>

    <div className={styles.actionBar} style={{ padding: '0 10px' }}>
      <Button onClick={submit} style={{ width: '100%' }} type="primary">提交审批</Button>
    </div>
  </div>
}