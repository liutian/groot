import { Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Radio, Row, Select, Space, Switch, TimePicker, Tooltip, Typography } from "antd";
import { VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, EditOutlined } from '@ant-design/icons';

import { useModel } from "@util/robot";
import styles from './index.module.less';
import WorkbenchModel from "@model/WorkbenchModel";
import PropPersistModel from "@model/PropPersistModel";
import PropHandleModel from "@model/PropHandleModel";
import { PropItemType } from "@grootio/common";
import NumberSlider from "@components/NumberSlider";
import TextEditor from "@components/TextEditor";
import { stringify } from "@util/utils";

type PropType = {
  block: PropBlock,
  freezeSetting?: boolean,
  noWrapMode?: boolean
}

function PropBlockPane({ block, freezeSetting, noWrapMode }: PropType) {
  const [propPersistModel, propPersistAction] = useModel<PropPersistModel>(PropPersistModel.modelName);
  const [propHandleModel, propHandleUpdateAction] = useModel<PropHandleModel>(PropHandleModel.modelName);
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
  const [form] = Form.useForm();

  const renderItemSetting = (propItem: PropItem, itemIndex: number) => {
    if (!workbenchModel.prototypeMode || freezeSetting) return null;

    const editPropItem = () => {
      propPersistAction(() => {
        propPersistModel.currSettingPropItem = JSON.parse(stringify(propItem));
      })
    }

    return (<Space size="small">

      <Typography.Link onClick={(e) => {
        e.preventDefault();
        editPropItem();
      }}>
        <EditOutlined />
      </Typography.Link>

      <Typography.Link onClick={(e) => {
        e.preventDefault();
        propPersistModel.delItem(propItem.id, block);
      }} >
        <DeleteOutlined />
      </Typography.Link>

      {
        itemIndex > 0 && (
          <Typography.Link onClick={(e) => {
            e.preventDefault();
            propPersistModel.movePropItem(block, itemIndex, true);
          }}>
            <VerticalAlignTopOutlined />
          </Typography.Link>
        )
      }

      {
        itemIndex < block.propItemList.length - 1 && (
          <Typography.Link onClick={(e) => {
            e.preventDefault();
            propPersistModel.movePropItem(block, itemIndex, false);
          }}>
            <VerticalAlignBottomOutlined />
          </Typography.Link>
        )
      }
    </Space>)
  }

  const renderItemLabel = (propItem: PropItem, itemIndex: number) => {

    if (block.layout === 'horizontal') {
      return <>
        {propItem.label}
        <i className="highlight" hidden={!propItem.highlight} />
      </>
    }

    return <div className={styles.propItemHeader}>
      <div className={styles.propItemHeaderText}>
        {propItem.label}
        <i className="highlight" hidden={!propItem.highlight} />
      </div>
      <div className={styles.propItemHeaderActions}>
        {renderItemSetting(propItem, itemIndex)}
      </div>
    </div>
  }

  const renderFormItem = (item: PropItem) => {
    if (item.type === PropItemType.Text) {
      return <Input />;
    } else if (item.type === PropItemType.Textarea) {
      return <Input.TextArea />;
    } else if (item.type === PropItemType.Number) {
      return <InputNumber keyboard />;
    } else if (item.type === PropItemType.Slider) {
      return <NumberSlider min={1} max={100} />;
    } else if (item.type === PropItemType.Button_Group) {
      return <Radio.Group>
        {item.optionList.map((option) => {
          return <Tooltip title={option.title}>
            <Radio.Button value={option.value}>{option.label}</Radio.Button>
          </Tooltip>
        })}
      </Radio.Group>;
    } else if (item.type === PropItemType.Switch) {
      return <Switch />
    } else if (item.type === PropItemType.Select) {
      return <Select options={item.optionList} />
    } else if (item.type === PropItemType.Radio) {
      return <Radio.Group options={item.optionList} />
    } else if (item.type === PropItemType.Checkbox) {
      return <Checkbox.Group options={item.optionList} />
    } else if (item.type === PropItemType.Date_Picker) {
      return <DatePicker />;
    } else if (item.type === PropItemType.Time_Picker) {
      return <TimePicker style={{ width: '100%' }} />;
    } else if (item.type === PropItemType.Flat) {
      return <Button block onClick={() => { propHandleModel.pushPropItemStack(item) }}>平铺</Button>
    } else if (item.type === PropItemType.Hierarchy) {
      return <Button block onClick={() => { propHandleModel.pushPropItemStack(item) }}>层级</Button>
    } else if (item.type === PropItemType.Json) {
      return <TextEditor type="json" />
    } else if (item.type === PropItemType.Function) {
      return <TextEditor type="function" />
    }

    return <>not found item</>
  }

  return <div className={noWrapMode ? styles.containerWrap : ''}>
    <Form form={form} layout={block.layout} labelAlign="left" colon={false} className={styles.propForm}
      onValuesChange={() => workbenchModel.iframeManager.refreshComponent(workbenchModel.component)}>
      <Row gutter={6}>
        {
          block.propItemList.map((item, index) => {
            return <Col span={block.layout === 'vertical' ? item.span : 24} key={item.id}
              onMouseEnter={() => {
                propHandleModel.setActivePropItemPath(item.id);
              }}
              onMouseLeave={() => {
                propHandleUpdateAction(() => {
                  propHandleModel.activePropItemId = 0;
                  propHandleModel.activePropItemPath = '';
                })
              }}>
              <div className={`${styles.propItemContainer} ${!workbenchModel.prototypeMode || freezeSetting || block.layout === 'vertical' ? '' : styles.hasAction}`}>
                <div className="content">
                  <Form.Item
                    className={styles.propItem} label={renderItemLabel(item, index)} name={item.propKey} preserve={false}
                    valuePropName={item.type === 'switch' ? 'checked' : 'value'} initialValue={item.defaultValue}>
                    {renderFormItem(item)}
                  </Form.Item>
                </div>
                <div className="action">{block.layout === 'horizontal' && renderItemSetting(item, index)}</div>
              </div>
            </Col>
          })
        }
      </Row>
    </Form>
    {
      (workbenchModel.prototypeMode && noWrapMode) ? (
        <Button type="primary" ghost block onClick={() => {
          propPersistModel.showPropItemSettinngForCreate(block)
        }}>
          添加配置项
        </Button>
      ) : null
    }
  </div>
}

export default PropBlockPane;