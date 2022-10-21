import { useEffect, useState } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";

import { ModalStatus } from "@util/common";
import { useModel } from "@util/robot";
import { APIPath } from "api/API.path";
import request from "@util/request";
import EditorModel from "pages/Instance/InstanceModel";

const InstanceAddModal: React.FC = () => {
  const [editorModel, updateAction] = useModel(EditorModel);
  const [form] = Form.useForm();
  const [componentList, setComponentList] = useState<Component[]>([]);

  useEffect(() => {
    if (editorModel.instanceAddModalStatus === ModalStatus.Init) {
      request(APIPath.component_list).then(({ data }) => {
        setComponentList(data);
      })
    }
  }, [editorModel.instanceAddModalStatus]);

  const handleOk = async () => {
    const formData = await form.validateFields();
    editorModel.addRootInstance(formData as ComponentInstance).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    updateAction(() => {
      editorModel.instanceAddModalStatus = ModalStatus.None;
    })
  }

  return <Modal visible={editorModel.instanceAddModalStatus !== ModalStatus.None} mask={false} title="新增实例"
    confirmLoading={editorModel.instanceAddModalStatus === ModalStatus.Submit}
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