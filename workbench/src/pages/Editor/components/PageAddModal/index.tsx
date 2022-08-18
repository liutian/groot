import { useModel } from "@util/robot";
import { Form, Input, Modal, Select } from "antd";
import { serverPath } from "config";
import EditorModel from "pages/Editor/EditorModel";
import { useEffect, useState } from "react";

const PageAddModal: React.FC = () => {
  const [editorModel, updateAction] = useModel<EditorModel>(EditorModel.modelName);
  const [form] = Form.useForm();
  const [componentList, setComponentList] = useState<Component[]>([]);

  useEffect(() => {
    fetch(`${serverPath}/component/list?container=false`).then(res => res.json()).then(({ data: list }: { data: Component[] }) => {
      setComponentList(list);
    })
  }, []);

  const handleOk = async () => {
    const formData = await form.validateFields();
    editorModel.addPage(formData as ComponentInstance).then(() => {
      form.resetFields();
    })
  }

  const handleCancel = () => {
    updateAction(() => {
      editorModel.showPageAddModal = false;
    })
  }

  return <Modal visible={editorModel.showPageAddModal} mask={false} title="新增页面"
    confirmLoading={editorModel.pageAddFetchLoading} onOk={handleOk} onCancel={handleCancel}>
    <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="路径" name="path" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="组件" name="componentId" rules={[{ required: true }]}>
        <Select>
          {
            componentList.map((c) => {
              return <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
            })
          }
        </Select>
      </Form.Item>
    </Form>
  </Modal>
}

export default PageAddModal;