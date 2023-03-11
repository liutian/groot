import { GrootType } from "@grootio/common";
import { ComponentSlot } from "@grootio/react"
import { Button, Form, FormInstance } from "antd";
import React, { useImperativeHandle } from "react"

let tick = 0;

type ItemType = { id: number, form?: FormInstance };
type PropsType = { _groot: GrootType } & { children: React.ReactElement[], value?: ItemType[], onChange?: (value: ItemType[]) => void };

const MultiDetailManager: React.FC<PropsType> = ({ children, _groot, value = [], onChange }) => {

  const add = () => {
    value.push({ id: ++tick });
    onChange([...value]);
  }

  const remove = (id: number) => {
    const index = value.findIndex(item => item.id === id);
    value.splice(index, 1);
    onChange([...value]);
  }

  return (<>
    <div>明细项</div>
    {
      _groot.controlMode && (<ComponentSlot children={children}></ComponentSlot>)
    }
    {
      !_groot.controlMode && value.map((item) => {
        return (<div key={item.id}>
          <FormAdapter ref={(form) => item.form = form} onChange={(values) => {
            const index = value.findIndex(data => data.id === item.id);
            values.id = value[index].id;
            value.splice(index, 1, values);
            onChange([...value]);
          }} >
            {children}
          </FormAdapter>
          <div>
            <Button onClick={() => remove(item.id)}>remove</Button>
          </div>
        </div>)
      })
    }
    <div>
      <Button onClick={add} type="primary" disabled={!!_groot.controlMode} style={{ width: '100%' }}>添加</Button>
    </div>
  </>)
}

const FormAdapter = React.forwardRef<FormInstance, { children: React.ReactElement[], onChange: (value: any) => void }>(({ children, onChange }, ref) => {
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => {
    return form;
  });

  return <Form component={false} form={form} onValuesChange={(_, values) => onChange(values)}>
    {children}
  </Form>;
})

export default MultiDetailManager;