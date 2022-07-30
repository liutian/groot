import { Form, Input } from "antd";

type PropsType = {
  freezeSetting: boolean,
  block: PropBlock
}

const PropBlockListPane: React.FC<PropsType> = () => {
  const list = ['one', 'two', 'three', 'four'];
  const list2 = ['aaa', 'bbb', 'ccc', 'ddd']
  const [form] = Form.useForm();

  return <>
    <div>
      <Form form={form} layout="vertical">
        {
          list.map((str) => {
            return (
              <div key={str}>
                {
                  list2.map((item) => {
                    return <FormItem key={item} name={str + item} label={str + item} />
                  })
                }
              </div>
            )
          })
        }
      </Form>
    </div>
    <div>options</div>
  </>
}

const FormItem = ({ name, label }) => {
  return <span >
    <Form.Item name={name} label={label}>
      <Input />
    </Form.Item>
  </span>
}

export default PropBlockListPane;