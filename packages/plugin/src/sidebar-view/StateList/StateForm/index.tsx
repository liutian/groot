import { Button, Form, Input, Select, Space } from "antd";
import { useEffect } from "react";

import { StateType, StateTypeMap, useModel, WorkbenchModelType } from "@grootio/common";
import StateModel from "../StateModel";

const StateForm: React.FC = () => {
  const stateModel = useModel(StateModel);
  const workbenchModel = useModel(WorkbenchModelType);

  const [form] = Form.useForm();

  useEffect(() => {
    if (stateModel.currState) {
      form.setFieldsValue({
        ...(stateModel.currState ? stateModel.currState : {}),
        releaseId: workbenchModel.application.release.id,
      });
    } else {
      form.resetFields();
    }

    if (!stateModel.isGlobalState) {
      form.setFieldValue('instanceId', workbenchModel.componentInstance.id);
    }
  }, [stateModel.formVisible]);

  const onSubmit = async () => {
    const stateData = await form.validateFields();

    if (stateModel.currState) {
      stateModel.updateState(stateData);
    } else {
      stateModel.addState(stateData);
    }
  }

  return <>

    <Form layout="vertical" form={form} colon={false} disabled={stateModel.currState?.isRuntime}>
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="内容" name="value" >
        <Input />
      </Form.Item>

      <Form.Item label="类型" name="type" initialValue={StateType.Str}>
        <Select options={StateTypeMap} fieldNames={{ label: 'name', value: 'key' }} />
      </Form.Item>
    </Form>

    <div style={{ display: 'flex' }}>
      <div style={{ flexGrow: 1 }}>
        <Button danger disabled={stateModel.currState?.isRuntime} onClick={() => stateModel.removeState()}>删除</Button>
      </div>
      <Space>
        <Button onClick={() => stateModel.hideForm()}>取消</Button>
        <Button type="primary" disabled={stateModel.currState?.isRuntime} onClick={() => onSubmit()}>提交</Button>
      </Space>
    </div>
  </>
}

export default StateForm;