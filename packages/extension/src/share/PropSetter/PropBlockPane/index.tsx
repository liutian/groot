import { Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Radio, Row, Select, Space, Switch, TimePicker, Tooltip, Typography } from "antd";
import { VerticalAlignTopOutlined, DeleteOutlined, VerticalAlignBottomOutlined, EditOutlined } from '@ant-design/icons';
import { useState } from "react";

import { PropBlock, PropBlockLayout, PropBlockLayoutKeyMap, PropItem, PropItemType, PropValueType, useModel, ValueStruct, ViewLoader } from "@grootio/common";
import { parsePropItemValue } from "@grootio/core";

import ComponentChildren from "./ComponentChildren";
import NumberSlider from "./NumberSlider";
import styles from './index.module.less';
import TextEditor from "./TextEditor";
import PropPersistModel from "../PropPersistModel";
import PropHandleModel from "../PropHandleModel";
import { getContext, grootCommandManager, grootStateManager, isPrototypeMode } from "context";
import { calcPropValueIdChain, parseOptions, RemotePluginKeySep, stringify } from "util/utils";

type PropType = {
  block: PropBlock,
  freezeSetting?: boolean,
  noWrapMode?: boolean
}

function PropBlockPane({ block, freezeSetting, noWrapMode }: PropType) {
  const propPersistModel = useModel(PropPersistModel);
  const propHandleModel = useModel(PropHandleModel);
  const [component] = grootStateManager().useStateByName('gs.studio.component')
  const [propSettingView] = grootStateManager().useStateByName('gs.studio.propSettingView', []);
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
    if (noSetting) return null;

    const editPropItem = () => {
      propPersistModel.currSettingPropItem = JSON.parse(stringify(propItem));
      if (propItem.optionList?.length) {
        propPersistModel.currSettingPropItem.optionList = propItem.optionList.map(option => JSON.parse(stringify(option)));
      }
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

    if (block.layout === PropBlockLayout.Horizontal) {
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
    // 延迟到渲染时在进行转换
    if (item.valueOptions && !item.optionList) {
      parseOptions(item);
    }

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
    formKey = `releaseId:${getContext().groot.params.application?.release.id}|instanceId:${instance.id}`;
  }

  return <div className={noWrapMode ? styles.containerWrap : ''}>
    <Form form={form} key={formKey} layout={PropBlockLayoutKeyMap[block.layout] as any} labelAlign="left" colon={false} className={styles.propForm}
      onValuesChange={(changedValues) => { updateValue(changedValues); }}>
      <Row gutter={6}>
        {
          block.propItemList.map((item, index) => {
            return <Col span={block.layout === PropBlockLayout.Vertical ? item.span : 24} key={item.id}
              onMouseEnter={() => {
                // todo 稍后实现
                propHandleModel.setPropPathChain(item.id);
              }}
              onMouseLeave={() => {
                // todo 稍后实现
                propHandleModel.setPropPathChain();
              }}>
              <div className={`${styles.propItemContainer} ${noSetting || block.layout === PropBlockLayout.Vertical
                ? '' : styles.hasAction}`}>
                <div className="content">
                  <Form.Item
                    className={styles.propItem} label={renderItemLabel(item, index)} name={item.propKey} preserve={false}
                    valuePropName={item.type === PropItemType.Switch ? 'checked' : 'value'} initialValue={getInitValue(item)}>
                    {renderFormItem(item)}
                  </Form.Item>
                </div>
                <div className="action">{block.layout === PropBlockLayout.Horizontal && renderItemSetting(item, index)}</div>
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