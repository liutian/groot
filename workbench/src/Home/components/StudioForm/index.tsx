import { Button, Col, DatePicker, Form, Input, Row, Space, Typography, Select, Popover } from "antd";
import { forwardRef, useState } from "react";
import { AppstoreAddOutlined, EditOutlined, VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, SettingOutlined } from '@ant-design/icons';

type PropType = {
  items: CodeMetaPropItem[],
  settingMode: boolean
}


function StudioForm({ items, settingMode }: PropType, ref: any) {
  const [form] = Form.useForm();
  const [, tick] = useState(0);
  const refresh = () => tick((pre: number) => ++pre);
  const [itemSettingForm] = Form.useForm();
  ref.current = form;

  const viewFormItem = (item: CodeMetaPropItem) => {
    let formItem;
    if (item.type === 'input') {
      formItem = <Input />;
    } else if (item.type === 'date-picker') {
      formItem = <DatePicker />
    }

    return formItem;
  }

  const addFormItem = () => {
    items.push({
      type: 'input',
      key: 'prop' + items.length,
      label: '属性' + items.length
    });
    refresh();
  }

  const viewItemLabel = (item: CodeMetaPropItem, itemIndex: number) => {
    const editMode = (item as any)._editMode;
    const inputRef = { current: null };

    const delItem = (itemIndex: number) => {
      items.splice(itemIndex, 1);
      refresh();
    }

    const moveItem = (originIndex: number, up: boolean) => {
      const [moveItem] = items.splice(originIndex, 1);
      if (up) {
        items.splice(originIndex - 1, 0, moveItem!);
      } else {
        items.splice(originIndex + 1, 0, moveItem!);
      }
      refresh();
    }

    const viewContent = () => {
      return <>
        <Form form={itemSettingForm} labelAlign="left" onValuesChange={(changedValues) => {
          if (changedValues.propType !== undefined) {
            item.type = changedValues.propType;
            delete item.value;
            refresh();
          }
        }} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
          <Form.Item label="类型" name="propType" >
            <Select options={[
              { label: '文本', value: 'input' },
              { label: '日期', value: 'date-picker' }
            ]} />
          </Form.Item>
          <Form.Item label="属性映射" name="bindProp">
            <Input />
          </Form.Item>
        </Form>
      </>
    }

    const viewItemSetting = () => {
      if (!settingMode) return null;

      return (<Space size="small">
        <Typography.Link disabled={itemIndex === 0} onClick={(e) => {
          e.stopPropagation();
          moveItem(itemIndex, true);
        }}>
          <VerticalAlignTopOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === items.length - 1} onClick={(e) => {
          e.stopPropagation();
          moveItem(itemIndex, false);
        }}>
          <VerticalAlignBottomOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === 0 && items.length === 1} onClick={(e) => {
          e.stopPropagation();
          delItem(itemIndex);
        }} >
          <DeleteOutlined />
        </Typography.Link>
        <Popover trigger="click" placement="bottomRight" overlayInnerStyle={{ width: '300px' }} content={viewContent}>
          <Typography.Link >
            <SettingOutlined />
          </Typography.Link>
        </Popover>

      </Space>)
    }

    return <Row>
      <Col span={16}>
        <Input maxLength={20} hidden={!editMode} ref={inputRef}
          style={{ width: '15em', boxShadow: 'none', borderColor: 'transparent' }}
          size="small" value={item.label}
          onBlur={() => {
            (item as any)._editMode = false;
            refresh();
          }}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            item.label = e.target.value;
            refresh();
          }} />

        <Space hidden={editMode}>
          {item.label}
          <a hidden={!settingMode} onClick={(e) => {
            e.stopPropagation();
            (item as any)._editMode = true;
            const inputEle = inputRef.current as any;
            setTimeout(() => {
              if (inputEle) {
                inputEle.focus();
              }
            }, 100)
            refresh();
          }}><EditOutlined /></a>
        </Space>
      </Col>
      <Col span={8} style={{ textAlign: 'right' }}>
        {viewItemSetting()}
      </Col>
    </Row>
  }

  return <>
    <Form form={form} layout="vertical" className="studio-form">
      {
        items.map((item, index) => {
          return (<Form.Item label={viewItemLabel(item, index)} key={item.key} name={item.key}>
            {viewFormItem(item)}
          </Form.Item>)
        })
      }
    </Form>
    <div hidden={!settingMode} style={{ textAlign: 'center' }}>
      <Button onClick={() => addFormItem()} type="link" icon={<AppstoreAddOutlined />}>添加</Button>
    </div>
  </>
}

export default forwardRef(StudioForm);