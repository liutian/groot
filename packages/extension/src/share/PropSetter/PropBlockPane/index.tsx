import { Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Radio, Row, Select, Space, Switch, TimePicker, Tooltip, Typography } from "antd";
import { VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, EditOutlined } from '@ant-design/icons';
import { useState } from "react";

import { pick, PropBlock, PropBlockLayout, PropBlockLayoutKeyMap, PropItem, PropItemType, PropValueType, useModel, ValueStruct, ViewLoader } from "@grootio/common";
import { parsePropItemValue } from "@grootio/core";

import ComponentChildren from "./ComponentChildren";
import NumberSlider from "./NumberSlider";
import styles from './index.module.less';
import TextEditor from "./TextEditor";
import PropPersistModel from "../PropPersistModel";
import PropHandleModel from "../PropHandleModel";
import { getContext, grootCommandManager, grootStateManager, isPrototypeMode } from "context";
import { calcPropValueIdChain, RemotePluginKeySep, stringify } from "util/utils";

type PropType = {
  block: PropBlock,
  freezeSetting?: boolean,
  noWrapMode?: boolean
}

function PropBlockPane({ block, freezeSetting, noWrapMode }: PropType) {
  const propPersistModel = useModel(PropPersistModel);
  const propHandleModel = useModel(PropHandleModel);
  const [component] = grootStateManager().useStateByName('gs.studio.component')
  const [propSettingView] = grootStateManager().useStateByName('gs.studio.propSettingViews', []);
  const [form] = Form.useForm();
  const noSetting = !isPrototypeMode() || freezeSetting || block.group.parentItem?.noSetting;

  const [getInitValue] = useState(() => {
    // const cacheMap = new Map<PropItem, any>();

    return (propItem: PropItem) => {
      // const hitValue = cacheMap.get(propItem);
      // if (hitValue) {
      //   return hitValue;
      // }

      const valueIdChain = calcPropValueIdChain(propItem);
      const propValue = propItem.valueList.filter(value => {
        return value.type === (isPrototypeMode() ? PropValueType.Prototype : PropValueType.Instance)
      }).find(value => {
        // 空字符串和null不相等
        return value.abstractValueIdChain === valueIdChain || (!value.abstractValueIdChain && !valueIdChain)
      })

      const value = parsePropItemValue(propItem, propValue?.value);
      // cacheMap.set(propItem, value);
      return value;
    }
  })

  const renderItemSetting = (propItem: PropItem, itemIndex: number) => {

    const editPropItem = () => {
      propPersistModel.currSettingPropItem = pick(propItem, ['id', 'type', 'propKey', 'rootPropKey', 'label', 'subType', 'span', 'optionList']);
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

  const renderItemLabel = (propItem: PropItem, itemIndex: number, action: boolean) => {

    if (action) {
      return <div className={`${styles.propItemHeader} `}>
        <div className={styles.propItemHeaderText}>
          {propItem.label}
          <i className="highlight" hidden={!propItem.highlight} />
        </div>
        <div className={styles.propItemHeaderActions}>
          {renderItemSetting(propItem, itemIndex)}
        </div>
      </div>

    } else {
      return <>
        {propItem.label}
        <i className="highlight" hidden={!propItem.highlight} />
      </>
    }

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
    } else if (item.type === PropItemType.ButtonGroup) {
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
    } else if (item.type === PropItemType.DatePicker) {
      return <DatePicker />;
    } else if (item.type === PropItemType.TimePicker) {
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
      return <ComponentChildren />
    } else if (item.type === PropItemType.Extension) {
      const config = propSettingView.find(configItem => `${configItem.packageName}${RemotePluginKeySep}${configItem.module}` === item.subType);
      return <ViewLoader {...config} />
    }

    return <>not found item</>
  }

  const updateValue = (changedValues: any) => {
    const updateKey = Object.keys(changedValues)[0];
    const propItem = block.propItemList.find(item => item.propKey === updateKey);
    const valueStruct = propItem.type === PropItemType.Component ? ValueStruct.ChildComponentList : undefined;

    propPersistModel.updateValue({
      propItem,
      value: changedValues[updateKey],
      valueStruct
    }).then(() => {
      if (!isPrototypeMode() && valueStruct === ValueStruct.ChildComponentList) {
        grootCommandManager().executeCommand('gc.workbench.makeDataToStage', 'all');
      } else {
        grootCommandManager().executeCommand('gc.workbench.makeDataToStage', 'current');
      }
    })
  }


  // 避免切换组件实例时表单控件无法刷新的问题
  let formKey;
  if (isPrototypeMode()) {
    formKey = `componentId:${component.id}|versionId:${component.componentVersion.id}`
  } else {
    const instance = grootStateManager().getState('gs.studio.componentInstance')
    formKey = `releaseId:${grootStateManager().getState('gs.studio.release').id}|instanceId:${instance.id}`;
  }

  return <div className={noWrapMode ? styles.container : ''}>
    <Form form={form} key={formKey} layout={PropBlockLayoutKeyMap[block.layout] as any}
      labelAlign="left" colon={false} className={`${styles.propForm} ${styles.compact}`}
      onValuesChange={(changedValues) => { updateValue(changedValues); }}>
      <Row gutter={6}>
        {
          block.propItemList.map((item, index) => {
            return <Col span={block.layout === PropBlockLayout.Vertical ? item.span : 24} key={item.id}
              onMouseEnter={() => {
                propHandleModel.setPropPathChain(item.id);
              }}
              onMouseLeave={() => {
                propHandleModel.setPropPathChain();
              }}>
              {
                block.layout === PropBlockLayout.Vertical ? (
                  <div className={`${styles.propItemContainer} ${styles.vertical} ${noSetting ? '' : styles.hasAction}`}>
                    <Form.Item label={renderItemLabel(item, index, true)} name={item.propKey} preserve={false}
                      valuePropName={item.type === PropItemType.Switch ? 'checked' : 'value'} initialValue={getInitValue(item)}>
                      {renderFormItem(item)}
                    </Form.Item>
                  </div>
                ) : (
                  <div className={`${styles.propItemContainer} ${styles.horizontal} ${noSetting ? '' : styles.hasAction}`}>
                    <div className="content">
                      <Form.Item label={renderItemLabel(item, index, false)} name={item.propKey} preserve={false}
                        valuePropName={item.type === PropItemType.Switch ? 'checked' : 'value'} initialValue={getInitValue(item)}>
                        {renderFormItem(item)}
                      </Form.Item>
                    </div>
                    <div className="action">{renderItemSetting(item, index)}</div>
                  </div>
                )
              }

            </Col>
          })
        }
      </Row>
    </Form>
    {
      // 平铺模式添加子项按钮在底部
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