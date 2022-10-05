import { Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Radio, Row, Select, Space, Switch, TimePicker, Tooltip, Typography } from "antd";
import { VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, EditOutlined } from '@ant-design/icons';

import { useModel } from "@util/robot";
import styles from './index.module.less';
import WorkbenchModel from "@model/WorkbenchModel";
import PropPersistModel from "@model/PropPersistModel";
import PropHandleModel from "@model/PropHandleModel";
import { PropItemType, PropValueType, RuntimeComponentValueType } from "@grootio/common";
import NumberSlider from "@components/NumberSlider";
import TextEditor from "@components/TextEditor";
import { calcPropValueIdChain, stringify } from "@util/utils";
import { useState } from "react";
import { processPropItemValue } from "@grootio/core";
import ComponentSelect from "@components/ComponentSelect";

type PropType = {
  block: PropBlock,
  freezeSetting?: boolean,
  noWrapMode?: boolean
}

function PropBlockPane({ block, freezeSetting, noWrapMode }: PropType) {
  const [propPersistModel, propPersistAction] = useModel(PropPersistModel);
  const [propHandleModel] = useModel(PropHandleModel);
  const [workbenchModel] = useModel(WorkbenchModel);
  const [form] = Form.useForm();
  const noSetting = !workbenchModel.prototypeMode || freezeSetting || block.group.parentItem?.noSetting;

  const [getInitValue] = useState(() => {
    const cacheMap = new Map<PropItem, any>();

    return (propItem: PropItem) => {
      const hitValue = cacheMap.get(propItem);
      if (hitValue) {
        return hitValue;
      }

      const valueIdChain = calcPropValueIdChain(propItem);
      const propValue = propItem.valueList.filter(value => {
        return value.type === (workbenchModel.prototypeMode ? PropValueType.Prototype : PropValueType.Instance)
      }).find(value => {
        // 空字符串和null不相等
        return value.abstractValueIdChain === valueIdChain || (!value.abstractValueIdChain && !valueIdChain)
      })

      const value = processPropItemValue(propItem, propValue?.value);
      cacheMap.set(propItem, value);


      if (propItem.type === PropItemType.Component && !value) {
        return { list: {} };
      }

      return value;
    }
  })

  const renderItemSetting = (propItem: PropItem, itemIndex: number) => {
    if (noSetting) return null;

    const editPropItem = () => {
      propPersistAction(() => {
        propPersistModel.currSettingPropItem = JSON.parse(stringify(propItem));
        if (propItem.optionList?.length) {
          propPersistModel.currSettingPropItem.optionList = propItem.optionList.map(option => JSON.parse(stringify(option)));
        }
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
    if (([PropItemType.Checkbox, PropItemType.Radio, PropItemType.Select, PropItemType.Button_Group] as string[]).includes(item.type)) {
      if (item.valueOptions && !item.optionList) {
        item.optionList = JSON.parse(item.valueOptions || '[]');
      }
    }

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
          return <Tooltip title={option.title} key={option.value}>
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
      return <Button block onClick={() => { propHandleModel.pushPropItemToStack(item) }}>平铺</Button>
    } else if (item.type === PropItemType.Hierarchy) {
      return <Button block onClick={() => { propHandleModel.pushPropItemToStack(item) }}>层级</Button>
    } else if (item.type === PropItemType.Json) {
      return <TextEditor type="json" />
    } else if (item.type === PropItemType.Function) {
      return <TextEditor type="function" />
    } else if (item.type === PropItemType.Component) {
      return <ComponentSelect parentInstanceId={workbenchModel.componentInstance?.id} prototypeMode={workbenchModel.prototypeMode} />
    }

    return <>not found item</>
  }

  const updateValue = (changedValues: any) => {
    const updateKey = Object.keys(changedValues)[0];
    const propItem = block.propItemList.find(item => item.propKey === updateKey);
    let extraInstanceList;
    if (propItem.type === PropItemType.Component) {
      extraInstanceList = (changedValues[updateKey] as RuntimeComponentValueType<ComponentInstance>).extraInstanceList;
      delete changedValues[updateKey].extraInstanceList;
    }

    propPersistModel.updateValue({ propItem, value: changedValues[updateKey] }).then(() => {
      propHandleModel.refreshComponent(extraInstanceList);
    })
  }

  // 避免切换组件实例时表单控件无法刷新的问题
  const formKey = workbenchModel.prototypeMode ?
    `componentId:${workbenchModel.component?.id}|versionId:${workbenchModel.componentVersion.id}`
    : `releaseId:${workbenchModel.application?.release.id}|instanceId:${workbenchModel.componentInstance?.id}`;

  return <div className={noWrapMode ? styles.containerWrap : ''}>
    <Form form={form} key={formKey} layout={block.layout} labelAlign="left" colon={false} className={styles.propForm}
      onValuesChange={(changedValues) => { updateValue(changedValues); }}>
      <Row gutter={6}>
        {
          block.propItemList.map((item, index) => {
            return <Col span={block.layout === 'vertical' ? item.span : 24} key={item.id}
              onMouseEnter={() => {
                workbenchModel.setPropPathChain(item.id);
              }}
              onMouseLeave={() => {
                workbenchModel.setPropPathChain();
              }}>
              <div className={`${styles.propItemContainer} ${noSetting || block.layout === 'vertical' ? '' : styles.hasAction}`}>
                <div className="content">
                  <Form.Item
                    className={styles.propItem} label={renderItemLabel(item, index)} name={item.propKey} preserve={false}
                    valuePropName={item.type === 'switch' ? 'checked' : 'value'} initialValue={getInitValue(item)}>
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
      (!noSetting && noWrapMode) ? (
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