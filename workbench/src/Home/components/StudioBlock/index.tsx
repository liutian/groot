import { Checkbox, Col, DatePicker, Form, Input, Radio, Row, Select, Space, Switch, Typography } from "antd";
import { VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from "@util/robot";
import StudioModel from '@model/Studio';
import ArrayObjectFormItem from "../ArrayObjectFormItem";
import styles from './index.module.less';

type PropType = {
  block: CodeMetaStudioBlock,
  noSetting?: boolean,
}

function StudioBlock({ block, noSetting }: PropType) {
  const [model, updateAction] = useModel<StudioModel>('studio');
  const [form] = Form.useForm();
  model.blockFormInstanceMap.set(block.id!, form);

  const renderItemLabel = (studioItem: CodeMetaStudioItem, itemIndex: number) => {

    const delStudioItem = (itemIndex: number) => {
      updateAction(() => {
        block.propItems.splice(itemIndex, 1);
      })
    }

    const editStudioItem = () => {
      updateAction(() => {
        model.currSettingStudioItem = JSON.parse(JSON.stringify(studioItem));
      })
    }

    const renderItemSetting = () => {
      if (!model.settingMode || noSetting === true) return null;

      return (<Space size="small">
        <Typography.Link onClick={(e) => {
          e.preventDefault();
          updateAction(() => {
            model.currSettingStudioItem = {
              id: 0,
              type: 'input',
              label: `配置项${block.propItems.length + 1}`,
              propKey: `prop${block.propItems.length + 1}`,
              blockId: block.id,
              groupId: block.groupId,
              span: 24
            }
            model.currSettingInsertIndex = block.propItems.findIndex(item => item.id === studioItem.id);
          })
        }}>
          <PlusOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === 0} onClick={(e) => {
          e.preventDefault();
          model.moveStudioItem(block, itemIndex, true);
        }}>
          <VerticalAlignTopOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === block.propItems.length - 1} onClick={(e) => {
          e.preventDefault();
          model.moveStudioItem(block, itemIndex, true);
        }}>
          <VerticalAlignBottomOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === 0 && block.propItems.length === 1} onClick={(e) => {
          e.preventDefault();
          delStudioItem(itemIndex);
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
  </>
}

export default StudioBlock;