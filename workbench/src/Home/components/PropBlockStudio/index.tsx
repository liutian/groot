import { Button, Checkbox, Col, DatePicker, Form, Input, Radio, Row, Select, Space, Switch, Typography } from "antd";
import { VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, SettingOutlined } from '@ant-design/icons';
import { useModel } from "@util/robot";
import StudioModel from '@model/StudioModel';
import styles from './index.module.less';

type PropType = {
  block: PropBlock,
  freezeSetting?: boolean,
  templateMode?: boolean
}

function PropBlockStudio({ block, freezeSetting, templateMode }: PropType) {
  const [model, updateAction] = useModel<StudioModel>('studio');
  const [form] = Form.useForm();
  model.blockFormInstanceMap.set(block.id!, form);

  const renderItemLabel = (propItem: PropItem, itemIndex: number) => {

    const editPropItem = () => {
      updateAction(() => {
        model.currSettingPropItem = JSON.parse(JSON.stringify(propItem));
      })
    }

    const renderItemSetting = () => {
      if (!model.editMode || freezeSetting === true) return null;


      return (<Space size="small">
        <Typography.Link disabled={itemIndex === 0} onClick={(e) => {
          e.preventDefault();
          model.movePropItem(block, itemIndex, true);
        }}>
          <VerticalAlignTopOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === block.propItemList.length - 1} onClick={(e) => {
          e.preventDefault();
          model.movePropItem(block, itemIndex, false);
        }}>
          <VerticalAlignBottomOutlined />
        </Typography.Link>
        <Typography.Link disabled={itemIndex === 0 && block.propItemList.length === 1} onClick={(e) => {
          e.preventDefault();
          model.delItem(propItem.id);
        }} >
          <DeleteOutlined />
        </Typography.Link>
        <Typography.Link onClick={(e) => {
          e.preventDefault();
          editPropItem();
        }}>
          <SettingOutlined />
        </Typography.Link>
      </Space>)
    }

    return <div className={styles.propItemHeader}>
      <div className={styles.propItemHeaderText}>
        {propItem.label}
        <i className="highlight" hidden={!propItem.highlight} />
      </div>
      <div className={styles.propItemHeaderActions}>
        {renderItemSetting()}
      </div>
    </div>
  }

  const renderFormItem = (item: PropItem) => {
    if (item.type === 'input') {
      return <Input />;
    } else if (item.type === 'date-picker') {
      return <DatePicker />;
    } else if (item.type === 'switch') {
      return <Switch />
    } else if (item.type === 'select') {
      return <Select options={item.optionList} />
    } else if (item.type === 'radio') {
      return <Radio.Group options={item.optionList} />
    } else if (item.type === 'checkbox') {
      return <Checkbox.Group options={item.optionList} />
    } else if (item.type === 'array-object') {
      return <Button block onClick={() => {
        model.pushHandUpPropItem(item)
      }}>列表{item.valueOfGroup?.propBlockList?.length}</Button>
    }

    return <>not found item</>
  }

  return <div className={templateMode ? styles.containerWrap : ''}>
    <Form form={form} layout="vertical" className="studio-form" onValuesChange={() => model.productStudioData()}>
      <Row gutter={6}>
        {
          block.propItemList.map((item, index) => {
            return <Col span={item.span} key={item.id} >
              <Form.Item className={styles.propItem} label={renderItemLabel(item, index)} name={item.propKey} preserve={false}
                valuePropName={item.type === 'switch' ? 'checked' : 'value'} initialValue={item.defaultValue}>
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
          model.showPropItemSettinngForCreate(block)
        }}>
          添加
        </Button>
      ) : null
    }
  </div>
}

export default PropBlockStudio;