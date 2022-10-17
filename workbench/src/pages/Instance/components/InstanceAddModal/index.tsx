import { ModalStatus } from "@util/common";
import { useModel } from "@util/robot";
import { Form, Input, Modal, Select, Switch } from "antd";
import { APIPath } from "api/API.path";
import request from "@util/request";
import EditorModel from "pages/Instance/InstanceModel";
import { useEffect, useState } from "react";

const InstanceAddModal: React.FC = () => {
  const [editorModel, updateAction] = useModel(EditorModel);
  const [form] = Form.useForm();
  const [componentList, setComponentList] = useState<Component[]>([]);

  useEffect(() => {
    if (editorModel.pageAddModalStatus === ModalStatus.Init) {
      request(APIPath.component_list, { container: false }).then(({ data }) => {
        setComponentList(data);
      })
    }
  }, [editorModel.pageAddModalStatus]);

  const handleOk = async () => {
    const formData = await form.validateFields();
    editorModel.addPage(formData as ComponentInstance).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    updateAction(() => {
      editorModel.pageAddModalStatus = ModalStatus.None;
    })
  }

  return <Modal visible={editorModel.pageAddModalStatus !== ModalStatus.None} mask={false} title="新增页面"
    confirmLoading={editorModel.pageAddModalStatus === ModalStatus.Submit}
    onOk={handleOk} onCancel={handleCancel} okText="新增">
    <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="路径" name="path" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item noStyle dependencies={['whitePage']}>
        {() => {
          const whitePage = form.getFieldValue('whitePage');
          return (<Form.Item label="组件" name="componentId" rules={[{ required: !whitePage }]}>
            <Select disabled={whitePage}>
              {
                componentList.map((c) => {
                  return <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                })
              }
            </Select>
          </Form.Item>)
        }}
      </Form.Item>


      <Form.Item label="空白页" name="whitePage">
        <Switch />
      </Form.Item>
    </Form>
  </Modal>
}

export default InstanceAddModal;