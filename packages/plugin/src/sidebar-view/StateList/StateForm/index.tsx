import { Button, Form, Input, Select, Space } from "antd";
import { useEffect } from "react";

import { StateTypeMap, useModel, WorkbenchModelType } from "@grootio/common";
import StateModel from "../StateModel";

const StateForm: React.FC = () => {
  const stateModel = useModel(StateModel);
  const workbenchModel = useModel(WorkbenchModelType);

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      ...(stateModel.currState ? stateModel.currState : {}),
      releaseId: workbenchModel.componentInstance.releaseId,
    });
    if (!stateModel.isGlobalState) {
      form.setFieldValue('instanceId', workbenchModel.componentInstance.id);
    }
  }, []);

  return < >

    <Form layout="vertical" form={form} colon={false} >
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="内容" name="value" >
        <Input />
      </Form.Item>

      <Form.Item label="类型" name="type">
        <Select options={StateTypeMap} fieldNames={{ label: 'name', value: 'key' }} />
      </Form.Item>
    </Form>

    <div style={{ display: 'flex' }}>
      <div style={{ flexGrow: 1 }}>
        <Button danger>删除</Button>
      </div>
      <Space>
        <Button onClick={() => stateModel.hideForm()}>取消</Button>
        <Button type="primary">提交</Button>
      </Space>
    </div>
  </ >
}

export default StateForm;