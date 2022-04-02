import { Form, Input, Modal } from "antd";
import React, { useEffect, useState } from "react";

type PropsType = { data?: GroupSettingDataType | null, finish: (result: GroupSettingDataType) => void };

const GroupSetting: React.FC<PropsType> = ({ data, finish }) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(true);

  const handleOk = async () => {
    const formGroup = await form.validateFields();
    finish({
      type: data?.type!,
      group: {
        ...data?.group,
        ...formGroup
      },
      index: data?.index
    });
  }

  const handleCancel = () => {
    setVisible(false);
  }

  useEffect(() => {
    if (data) {
      form.resetFields();
      form.setFieldsValue(data.group);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [data]);

  return (<Modal mask={false} width={400} title="设置分组" visible={!!data && visible} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item name="title" label="名称" required={true}>
        <Input />
      </Form.Item>
    </Form>
  </Modal>)
}

export type GroupSettingDataType = { type: 'add' | 'edit', group: CodeMetaPropGroup, index?: number };
export default GroupSetting;