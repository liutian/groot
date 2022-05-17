import { Button, Checkbox, Col, DatePicker, Form, Input, Radio, Row, Select, Space, Switch, Typography } from "antd";
import { VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, SettingOutlined } from '@ant-design/icons';
import { useModel } from "@util/robot";
import StudioModel from '@model/Studio';
import ArrayObjectFormItem from "../ArrayObjectFormItem";
import styles from './index.module.less';

type PropType = {
  block: CodeMetaStudioBlock,
  dynamic?: boolean,
  templateMode?: boolean
}

function StudioBlock({ block, dynamic, templateMode }: PropType) {
  const [model, updateAction] = useModel<StudioModel>('studio');
  const [form] = Form.useForm();
  model.blockFormInstanceMap.set(block.id!, form);

  const renderItemLabel = (studioItem: CodeMetaStudioItem, itemIndex: number) => {

    const editStudioItem = () => {
      updateAction(() => {
        model.currSettingStudioItem = JSON.parse(JSON.stringify(studioItem));
      })
    }

    const renderItemSetting = () => {
      if (!model.settingMode || dynamic === true) return null;


      return (<Space size="small">
        <Typography.Link disabled={itemIndex === 0} onClick={(e) => {
          e.preventDefault();
          model.moveStudioItem(block, itemIndex, true);
        }}>
          <VerticalAlignTopOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === block.propItems.length - 1} onClick={(e) => {
          e.preventDefault();
          model.moveStudioItem(block, itemIndex, false);
        }}>
          <VerticalAlignBottomOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === 0 && block.propItems.length === 1} onClick={(e) => {
          e.preventDefault();
          model.delItem(studioItem.id, block);
        }} >
          <DeleteOutlined />
        </Typography.Link>
        <Typography.Link onClick={(e) => {
          e.preventDefault();
          editStudioItem();
        }}>
          <SettingOutlined />
        </Typography.Link>
      </Space>)
    }

    return <div className={styles.studioItemHeader}>
      <div className={styles.studioItemHeaderText}>
        {studioItem.label}
      </div>
      <div className={styles.studioItemHeaderActions}>
        {renderItemSetting()}
      </div>
    </div>
  }

  const renderFormItem = (item: CodeMetaStudioItem) => {
    if (item.type === 'input') {
      return <Input />;
    } else if (item.type === 'date-picker') {
      return <DatePicker />;
    } else if (item.type === 'switch') {
      return <Switch />
    } else if (item.type === 'select') {
      return <Select options={item.options} />
    } else if (item.type === 'radio') {
      return <Radio.Group options={item.options} />
    } else if (item.type === 'checkbox') {
      return <Checkbox.Group options={item.options} />
    } else if (item.type === 'array-object') {
      return <ArrayObjectFormItem item={item}></ArrayObjectFormItem>
    }

    return <>not found item</>
  }

  return <>
    <Form form={form} layout="vertical" className="studio-form" onValuesChange={() => model.productStudioData()}>
      <Row gutter={6}>
        {
          block.propItems.map((item, index) => {
            return <Col span={item.span} key={item.id} >
              <Form.Item className={styles.studioItem} label={renderItemLabel(item, index)} name={item.propKey} preserve={false}
                valuePropName={item.type === 'switch' ? 'checked' : 'value'} initialValue={item.value || item.defaultValue}>
                {renderFormItem(item)}
              </Form.Item>
            </Col>
          })
        }
      </Row>
    </Form>
    {
      templateMode ? (
        <Button type="dashed" block onClick={() => {
          model.showStudioItemSettinngForCreate(block)
        }}>
          添加
        </Button>
      ) : null
    }
  </>
}

export default StudioBlock;