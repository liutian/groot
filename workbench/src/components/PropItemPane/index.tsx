import TextEditor from "@components/TextEditor"
import { PropItemType } from "@grootio/common"
import PropHandleModel from "@model/PropHandleModel";
import { Button, Checkbox, DatePicker, Input, Radio, Select, Switch, TimePicker } from "antd"

import { useModel } from "@util/robot";

type PropsType = {
  item: PropItem
}

const PropItemPane: React.FC<PropsType> = ({ item }) => {
  const [propHandleModel] = useModel<PropHandleModel>(PropHandleModel.modelName);

  const renderFormItem = () => {
    if (item.type === PropItemType.TEXT) {
      return <Input />;
    } else if (item.type === PropItemType.TEXTAREA) {
      return <Input.TextArea />;
    } else if (item.type === PropItemType.DATE_PICKER) {
      return <DatePicker />;
    } else if (item.type === PropItemType.TIME_PICKER) {
      return <TimePicker style={{ width: '100%' }} />;
    } else if (item.type === PropItemType.SWITCH) {
      return <Switch />
    } else if (item.type === PropItemType.SELECT) {
      return <Select options={item.optionList} />
    } else if (item.type === PropItemType.RADIO) {
      return <Radio.Group options={item.optionList} />
    } else if (item.type === PropItemType.CHECKBOX) {
      return <Checkbox.Group options={item.optionList} />
    } else if (item.type === PropItemType.LIST) {
      return <Button block onClick={() => { propHandleModel.pushPropItemStack(item) }}>
        列表{item.valueOfGroup.propBlockList.length}
      </Button>
    } else if (item.type === PropItemType.ITEM) {
      return <Button block onClick={() => { propHandleModel.pushPropItemStack(item) }}>配置项</Button>
    } else if (item.type === PropItemType.HIERARCHY) {
      return <Button block onClick={() => { propHandleModel.pushPropItemStack(item) }}>层级</Button>
    } else if (item.type === PropItemType.JSON) {
      return <TextEditor type="json" />
    } else if (item.type === PropItemType.FUNCTION) {
      return <TextEditor type="function" />
    }

    return <>not found item</>
  }

  return <>
    {renderFormItem()}
  </>
}

export default PropItemPane;