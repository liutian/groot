import { DeleteOutlined, DragOutlined, SettingOutlined } from "@ant-design/icons";
import { PropBlockStructType, PropItemType } from "@grootio/common";
import { processPropItemValue } from "@grootio/core";
import PropHandleModel from "@model/PropHandleModel";
import PropPersistModel from "@model/PropPersistModel";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { DatePicker, Form, Input, InputNumber, Select, Space, Switch, Table, TimePicker, Typography } from "antd";
import { useState } from "react";

import styles from './index.module.less';

type PropsType = {
  block: PropBlock
}

const PropBlockListStructPane: React.FC<PropsType> = ({ block: propBlock }) => {
  propBlock.primaryShowPropItemList = [];
  const childPropItem = propBlock.propItemList[0];
  const childPropBlockList = childPropItem.childGroup.propBlockList;
  const dataSourceEditable = !!childPropItem.block.group.root || childPropItem.block.group.parentItem?.tempAbstractValueId;
  const dataSource = [];

  const [propHandleModel] = useModel(PropHandleModel);
  const [workbenchModel] = useModel(WorkbenchModel);
  const [propPersistModel] = useModel(PropPersistModel);
  const [form] = Form.useForm();

  const [getInitValue] = useState(() => {
    const cacheMap = new Map<PropItem, Map<number, any>>();

    return (propItem: PropItem, abstractValueId: number) => {
      const hitValue = cacheMap.get(propItem)?.get(abstractValueId);
      if (hitValue) {
        return hitValue;
      }

      const propValue = propItem.valueList.find(value => {
        return value.abstractValueIdChain.endsWith(`${abstractValueId}`)
      });
      const value = processPropItemValue(propItem, propValue?.value);
      let valuesMap = cacheMap.get(propItem);
      if (!valuesMap) {
        valuesMap = new Map();
        cacheMap.set(propItem, valuesMap);
      }
      valuesMap.set(abstractValueId, value);

      return value;
    }
  });

  if (propBlock.struct === PropBlockStructType.List) {
    if (!Array.isArray(propBlock.listStructData)) {
      propBlock.listStructData = JSON.parse(propBlock.listStructData || '[]');
    }
  }

  propBlock.listStructData.forEach((propItemId) => {
    childPropBlockList.forEach((block) => {
      const propItem = block.propItemList.find(item => item.id === propItemId);
      if (propItem) {
        propBlock.primaryShowPropItemList.push(propItem);
      }
    })
  });

  const columns = propBlock.primaryShowPropItemList.map((propItem) => {
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
    if (childPropItem.block.group.parentItem?.tempAbstractValueId) {
      const tempAbstractValueId = childPropItem.block.group.parentItem?.tempAbstractValueId;
      const regex = new RegExp(`^${tempAbstractValueId}$|,${tempAbstractValueId}$`);
      valueList = childPropItem.valueList.filter(value => {
        return regex.test(value.abstractValueIdChain);
      });
    }

    valueList.forEach((abstractValue: PropValue) => {
      dataSource.push({
        abstractValueId: abstractValue.id
      });
    })
  }

  const showPrimaryItem = () => {
    propHandleModel.pushPropItemStack(childPropItem);
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
    } else if (item.type === PropItemType.Date_Picker) {
      return <DatePicker />;
    } else if (item.type === PropItemType.Time_Picker) {
      return <TimePicker style={{ width: '100%' }} />;
    }

    return <>not found item</>
  }

  const showPropItemSetting = (abstractValueId: number) => {
    childPropItem.tempAbstractValueId = abstractValueId;
    childPropItem.noSetting = true;
    propHandleModel.pushPropItemStack(childPropItem);
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

    propPersistModel.updateValue(propItem, changedValues[updateKey], +abstractValueId);
  }

  // 避免切换组件实例时表单控件无法刷新的问题
  const formKey = workbenchModel.prototypeMode ?
    `componentId:${workbenchModel.component?.id}|versionId:${workbenchModel.component?.version.id}`
    : `releaseId:${workbenchModel.application?.release.id}|instanceId:${workbenchModel.componentInstance?.id}`;

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
          workbenchModel.prototypeMode && (
            <>
              <Typography.Link hidden={!workbenchModel.prototypeMode}
                onClick={() => showPrimaryItem()}>
                首要显示项
              </Typography.Link>
              <Typography.Link hidden={!workbenchModel.prototypeMode}
                onClick={() => propHandleModel.pushPropItemStack(childPropItem)}>
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