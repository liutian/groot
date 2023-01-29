import { useEffect, useState } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";
import { APIPath, Component, ComponentInstance, ModalStatus, useModel } from "@grootio/common";

import request from "@util/request";
import InstanceModel from "pages/Instance/InstanceModel";

const InstanceAddModal: React.FC = () => {
  const instanceModel = useModel(InstanceModel);
  const [form] = Form.useForm();
  const [componentList, setComponentList] = useState<Component[]>([]);

  useEffect(() => {
    if (instanceModel.instanceAddModalStatus === ModalStatus.Init) {
      request(APIPath.component_list).then(({ data }) => {
        setComponentList(data);
      })
    }
  }, [instanceModel.instanceAddModalStatus]);

  const handleOk = async () => {
    const formData = await form.validateFields();
    instanceModel.addRootInstance(formData as ComponentInstance).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    instanceModel.instanceAddModalStatus = ModalStatus.None;
  }

  return <Modal open={instanceModel.instanceAddModalStatus !== ModalStatus.None} mask={false} title="新增实例"
    confirmLoading={instanceModel.instanceAddModalStatus === ModalStatus.Submit}
    onOk={handleOk} onCancel={handleCancel} okText="新增">
    <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="英文名称" name="key" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item noStyle dependencies={['empty']}>
        {() => {
          const empty = form.getFieldValue('empty');
          return (<Form.Item label="原型" name="componentId" rules={[{ required: !empty }]}>
            <Select disabled={empty}>
              {
                componentList.map((c) => {
                  return <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                })
              }
            </Select>
          </Form.Item>)
        }}
      </Form.Item>

      <Form.Item label="空实例" name="empty" valuePropName="checked">
        <Switch onChange={(event) => {
          if (event) {
            form.setFieldsValue({ componentId: null });
          }
        }} />
      </Form.Item>
    </Form>
  </Modal>
}

export default InstanceAddModal;