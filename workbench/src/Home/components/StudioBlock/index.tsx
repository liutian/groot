import { Col, DatePicker, Form, Input, Row, Space, Typography } from "antd";
import { VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, SettingOutlined } from '@ant-design/icons';
import { useModel } from "@util/robot";
import StudioModel from '@model/Studio';

type PropType = {
  block: CodeMetaStudioPropBlock,
  group: CodeMetaStudioPropGroup
}

function StudioBlock({ block, group }: PropType) {
  const [model, updateAction] = useModel<StudioModel>('studio');
  const [form] = Form.useForm();
  model.blockFormInstanceMap.set(`${group.id}-${block.id}`, form);

  const renderItemLabel = (studioItem: CodeMetaStudioPropItem, itemIndex: number) => {

    const delStudioItem = (itemIndex: number) => {
      updateAction(() => {
        block.propItems.splice(itemIndex, 1);
      })
    }

    const editStudioItem = () => {
      updateAction(() => {
        model.currSettingStudioItem = JSON.parse(JSON.stringify(studioItem));
        model.currBlockOfSettingStudioItem = block;
      })
    }

    const renderItemSetting = () => {
      if (!model.settingMode) return null;

      return (<Space size="small">
        <Typography.Link disabled={itemIndex === 0} onClick={(e) => {
          e.stopPropagation();
          model.moveStudioItem(block, itemIndex, true);
        }}>
          <VerticalAlignTopOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === block.propItems.length - 1} onClick={(e) => {
          e.stopPropagation();
          model.moveStudioItem(block, itemIndex, true);
        }}>
          <VerticalAlignBottomOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === 0 && block.propItems.length === 1} onClick={(e) => {
          e.stopPropagation();
          delStudioItem(itemIndex);
        }} >
          <DeleteOutlined />
        </Typography.Link>
        <Typography.Link onClick={(e) => {
          e.stopPropagation();
          editStudioItem();
        }}>
          <SettingOutlined />
        </Typography.Link>
      </Space>)
    }

    return <Row>
      <Col span={12}>
        {studioItem.label}
      </Col>
      <Col span={12} style={{ textAlign: 'right' }}>
        {renderItemSetting()}
      </Col>
    </Row>
  }

  const renderFormItem = (item: CodeMetaStudioPropItem) => {
    if (item.type === 'input') {
      return <Input />;
    } else if (item.type === 'date-picker') {
      return <DatePicker />;
    }

    return <>not found item</>
  }

  return <>
    <Form form={form} layout="vertical" className="studio-form" onValuesChange={() => model.productStudioData()}>
      <Row gutter={6}>
        {
          block.propItems.map((item, index) => {
            return <Col span={item.span} key={item.id} >
              <Form.Item label={renderItemLabel(item, index)} name={item.propKey} initialValue={item.value || item.defaultValue}>
                {renderFormItem(item)}
              </Form.Item>
            </Col>
          })
        }
      </Row>

    </Form>
  </>
}

export default StudioBlock;