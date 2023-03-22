import { DatePicker, Form, Input, InputNumber, Select, Space, Switch, Table, TimePicker, Tooltip, Typography } from "antd";
import { DeleteOutlined, DragOutlined, QuestionCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { PropBlock, PropBlockStructType, PropItem, PropItemType, PropValue, PropValueType, useModel } from "@grootio/common";
import { parsePropItemValue } from "@grootio/core";
import { useState } from "react";


import styles from './index.module.less';
import PropHandleModel from "../PropHandleModel";
import PropPersistModel from "../PropPersistModel";
import { grootManager, isPrototypeMode } from "context";

type PropsType = {
  block: PropBlock
}

const PropBlockListStructPane: React.FC<PropsType> = ({ block: propBlock }) => {
  const childPropItem = propBlock.propItemList[0];
  const childPropBlockList = childPropItem.childGroup.propBlockList;
  const dataSourceEditable = !childPropItem.block.group.parentItemId || childPropItem.block.group.parentItem?.tempAbstractValueId;
  const dataSource = [];

  const propHandleModel = useModel(PropHandleModel);
  const propPersistModel = useModel(PropPersistModel);
  const [form] = Form.useForm();
  const [component] = grootManager.state.useStateByName('gs.component')


  const [getInitValue] = useState(() => {
    const cacheMap = new Map<PropItem, Map<number, any>>();

    return (propItem: PropItem, abstractValueId: number) => {
      const hitValue = cacheMap.get(propItem)?.get(abstractValueId);
      if (hitValue) {
        return hitValue;
      }

      const propValue = propItem.valueList.filter(value => {
        return value.type === (isPrototypeMode() ? PropValueType.Prototype : PropValueType.Instance)
      }).find(value => {
        return value.abstractValueIdChain.endsWith(`${abstractValueId}`);
      })
      const value = parsePropItemValue(propItem, propValue?.value);
      let valuesMap = cacheMap.get(propItem);
      if (!valuesMap) {
        valuesMap = new Map();
        cacheMap.set(propItem, valuesMap);
      }
      valuesMap.set(abstractValueId, value);

      return value;
    }
  });

  const primaryShowPropItemList = [];
  propBlock.listStructData.forEach((propItemId) => {
    childPropBlockList.forEach((block) => {
      const propItem = block.propItemList.find(item => item.id === propItemId);
      if (propItem) {
        primaryShowPropItemList.push(propItem);
      }
    })
  });

  const columns = primaryShowPropItemList.map((propItem) => {
    return {
      title: propItem.label,
      dataIndex: `propItemId_${propItem.id}`,
      width: '',
      render: (_, record) => {
        return (
          <Form.Item name={`propItemId_${propItem.id}_abstractValueId_${record.abstractValueId}`} initialValue={getInitValue(propItem, record.abstractValueId)} preserve={false}>
            {renderFormItem(propItem)}
          </Form.Item>
        )
      }
    }
  });
  columns.push({
    title: '',
    dataIndex: '#action',
    width: '50px',
    render: (_, record) => {
      return (<Space>
        <Typography.Link >
          <SettingOutlined onClick={() => showPropItemSetting(record.abstractValueId)} />
        </Typography.Link>

        <Typography.Link>
          <DeleteOutlined onClick={() => propPersistModel.removeBlockListStructChildItem(record.abstractValueId, childPropItem)} />
        </Typography.Link>

        <Typography.Link>
          <DragOutlined />
        </Typography.Link>
      </Space>)
    }
  });

  if (dataSourceEditable) {
    let valueList = childPropItem.valueList;
    const tempAbstractValueId = childPropItem.block.group.parentItem?.tempAbstractValueId;
    if (tempAbstractValueId) {
      const regex = new RegExp(`^${tempAbstractValueId}$|,${tempAbstractValueId}$`);
      valueList = childPropItem.valueList.filter(value => {
        return regex.test(value.abstractValueIdChain);
      });
    }

    const prototypeValueList = valueList.filter(value => value.type === PropValueType.Prototype);
    const instanceValueList = valueList.filter(value => value.type === PropValueType.Instance);

    if (!isPrototypeMode() && instanceValueList.length) {
      valueList = instanceValueList;
    } else {
      valueList = prototypeValueList;
    }

    valueList.forEach((abstractValue: PropValue) => {
      dataSource.push({
        abstractValueId: abstractValue.id
      });
    })
  }

  const showPrimaryItem = () => {
    propHandleModel.pushPropItemToStack(childPropItem);
    childPropItem.extraUIData = {
      type: 'BlockListPrefs',
      data: propBlock
    }
  }

  const renderFormItem = (item: PropItem) => {

    if (item.type === PropItemType.Text) {
      return <Input />;
    } else if (item.type === PropItemType.Number) {
      return <InputNumber keyboard />;
    } else if (item.type === PropItemType.Switch) {
      return <Switch />
    } else if (item.type === PropItemType.Select) {
      return <Select options={item.optionList} />
    } else if (item.type === PropItemType.DatePicker) {
      return <DatePicker />;
    } else if (item.type === PropItemType.TimePicker) {
      return <TimePicker style={{ width: '100%' }} />;
    } else {
      return <>
        该类型不支持 <Tooltip title="仅支持文本，数字，开关，下拉框，日期，时间">
          <QuestionCircleOutlined />
        </Tooltip>
      </>
    }
  }

  const showPropItemSetting = (abstractValueId: number) => {
    childPropItem.tempAbstractValueId = abstractValueId;
    childPropItem.noSetting = true;
    propHandleModel.pushPropItemToStack(childPropItem);
  }

  const updateValue = (changedValues: any) => {
    const updateKey = Object.keys(changedValues)[0];
    const [propItemId, abstractValueId] = updateKey.replace('propItemId_', '').replace('_abstractValueId_', '$').split('$');
    let propItem;
    childPropItem.childGroup.propBlockList.forEach((block) => {
      block.propItemList.forEach((item) => {
        if (item.id === +propItemId) {
          propItem = item;
        }
      })
    });

    propPersistModel.updateValue({ propItem, value: changedValues[updateKey], abstractValueId: +abstractValueId }).then(() => {
      grootManager.command.executeCommand('gc.makeDataToStage', 'current');
    })
  }

  // 避免切换组件实例时表单控件无法刷新的问题
  let formKey;
  if (isPrototypeMode()) {
    formKey = `componentId:${component.id}|versionId:${component.componentVersion.id}`
  } else {
    const instance = grootManager.state.getState('gs.componentInstance')
    formKey = `releaseId:${grootManager.state.getState('gs.release').id}|instanceId:${instance.id}`;
  }

  return <div className={styles.container}>
    <Form form={form} layout="vertical" key={formKey} onValuesChange={(changedValues) => { updateValue(changedValues) }}>

      <Table className={styles.tablePatch} rowKey="abstractValueId" columns={columns} dataSource={dataSource} size="small" pagination={false} ></Table>

    </Form>

    <div>
      <Space>
        {
          (dataSourceEditable) && <Typography.Link
            onClick={() => propPersistModel.addAbstractTypeValue(childPropItem)}
            disabled={!propBlock.listStructData.length}>
            添加子项
          </Typography.Link>
        }

        {
          isPrototypeMode() && (
            <>
              <Typography.Link onClick={() => showPrimaryItem()}>
                首要显示项
              </Typography.Link>
              <Typography.Link onClick={() => propHandleModel.pushPropItemToStack(childPropItem)}>
                子项模版配置
              </Typography.Link>
            </>
          )
        }
      </Space>
    </div>
  </div>
}


export default PropBlockListStructPane;