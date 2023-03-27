import { QuestionCircleOutlined } from "@ant-design/icons";
import { PropItem, PropItemStruct, PropItemViewType } from "@grootio/common";
import { Button, Checkbox, DatePicker, Form, Input, InputNumber, Radio, Select, Switch, TimePicker, Tooltip } from "antd";
import { grootManager } from "context";
import ComponentChildren from "./ComponentChildren";
import NumberSlider from "./NumberSlider";
import TextEditor from "./TextEditor";

type PropType = {
  formItemProps: any,
  propItem: PropItem,
  simplify: boolean
}

const FormRender: React.FC<PropType> = ({ propItem, simplify, formItemProps, ...props }) => {
  let field = <>未知类型</>

  if (propItem.struct === PropItemStruct.Flat) {
    field = <Button block onClick={() => {
      grootManager.command.executeCommand('gc.pushPropItemToStack', propItem)
    }}>平铺</Button>
  } else if (propItem.struct === PropItemStruct.Hierarchy) {
    field = <Button block onClick={() => {
      grootManager.command.executeCommand('gc.pushPropItemToStack', propItem)
    }}>层级</Button>
  } else if (propItem.viewType === PropItemViewType.Text) {
    field = <Input {...props} />;
  } else if (propItem.viewType === PropItemViewType.Number) {
    field = <InputNumber keyboard {...props} />;
  } else if (propItem.viewType === PropItemViewType.Switch) {
    formItemProps.valuePropName = 'checked'
    field = <Switch {...props} />
  } else if (propItem.viewType === PropItemViewType.Select) {
    field = <Select options={propItem.optionList} {...props} />
  } else if (propItem.viewType === PropItemViewType.DatePicker) {
    field = <DatePicker {...props} />;
  } else if (propItem.viewType === PropItemViewType.TimePicker) {
    field = <TimePicker style={{ width: '100%' }} {...props} />;
  } else {

    if (simplify) {
      field = <>
        该类型不支持 <Tooltip title="仅支持文本，数字，开关，下拉框，日期，时间">
          <QuestionCircleOutlined />
        </Tooltip>
      </>
    } else {
      if (propItem.viewType === PropItemViewType.Textarea) {
        field = <Input.TextArea {...props} />;
      } else if (propItem.viewType === PropItemViewType.Slider) {
        field = <NumberSlider min={1} max={100} {...props} />;
      } else if (propItem.viewType === PropItemViewType.ButtonGroup) {
        field = <Radio.Group {...props}>
          {propItem.optionList.map((option) => {
            return <Tooltip title={option.title} key={option.value}>
              <Radio.Button value={option.value}>{option.label}</Radio.Button>
            </Tooltip>
          })}
        </Radio.Group>;
      } else if (propItem.viewType === PropItemViewType.Radio) {
        field = <Radio.Group options={propItem.optionList} {...props} />
      } else if (propItem.viewType === PropItemViewType.Checkbox) {
        field = <Checkbox.Group options={propItem.optionList} {...props} />
      } else if (propItem.viewType === PropItemViewType.Json) {
        field = <TextEditor type="json" {...props} />
      } else if (propItem.viewType === PropItemViewType.Function) {
        field = <TextEditor type="function" {...props} />
      } else if (propItem.viewType === PropItemViewType.Component) {
        field = <ComponentChildren {...props} />
      }
    }
  }

  return <Form.Item {...formItemProps}>{field}</Form.Item>

}

export default FormRender