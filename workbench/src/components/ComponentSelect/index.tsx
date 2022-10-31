import { DeleteOutlined, DragOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Select } from 'antd';
import { useEffect, useState } from 'react';

import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import { APIPath } from 'api/API.path';
import request from '@util/request';
import styles from './index.module.less';
import { ComponentValueItemType, PostMessageType, RuntimeComponentValueType } from '@grootio/common';
import PropPersistModel from '@model/PropPersistModel';
import { BreadcrumbChange } from '@util/common';

type PropType = {
  value?: RuntimeComponentValueType,
  onChange?: (newValue: RuntimeComponentValueType) => void;
  parentInstanceId?: number,
  prototypeMode: boolean
};

const ComponentSelect: React.FC<PropType> = ({ value: _value, onChange: _onChange, parentInstanceId, prototypeMode }) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const [valueList, setValueList] = useState<ComponentValueItemType[]>(() => {
    if (_value.list.length) {
      return [..._value.list]
    } else {
      return [{} as ComponentValueItemType]
    }
  });

  if (prototypeMode) {
    return <Select disabled></Select>
  }

  const onChange = (newValue: ComponentValueItemType, index: number) => {
    valueList[index] = newValue;
    _value.list = [...valueList];
    _onChange({ ..._value });
  }

  const add = () => {
    valueList.push({} as ComponentValueItemType);
    setValueList([...valueList]);
  }

  const remove = (value: ComponentValueItemType, index: number) => {
    if (value.instanceId) {
      request(APIPath.componentInstance_remove, { instanceId: value.instanceId }).then(() => {
        const instanceIndex = workbenchModel.instanceList.findIndex(i => i.id === value.instanceId);
        workbenchModel.instanceList.splice(instanceIndex, 1);

        valueList.splice(index, 1);
        _value.list = [...valueList];
        _onChange({ ..._value });
      });
    } else {
      valueList.splice(index, 1);
      setValueList([...valueList]);
    }
  }

  return <div className={styles.container}>
    {
      valueList.map((valueItem, index) => {
        return (<div className={styles.itemContainer} key={index}>

          <ComponentSelectItem value={valueItem} onChange={(newValue) => onChange(newValue, index)} parentInstanceId={parentInstanceId} />

          <div className={styles.suffix}>
            <Button type="link" onClick={() => {
              workbenchModel.iframeManager.notifyIframe(PostMessageType.OuterWrapperSelect, {
                id: valueItem.instanceId,
                action: BreadcrumbChange.Append
              })
            }}>
              <EditOutlined />
            </Button>

            <Button type="link" onClick={add}>
              <PlusOutlined />
            </Button>

            <Button type="link" onClick={() => remove(valueItem, index)} disabled={valueList.length <= 1}>
              <DeleteOutlined />
            </Button>

            <Button type="link" >
              <DragOutlined />
            </Button>
          </div>
        </div>
        )
      })
    }
  </div>
}

type ItemPropTypeItem = {
  value?: ComponentValueItemType,
  onChange?: (newValue: ComponentValueItemType) => void;
  parentInstanceId?: number,
};

const ComponentSelectItem: React.FC<ItemPropTypeItem> = ({ value, onChange: _onChange, parentInstanceId }) => {
  const [propPersistModel] = useModel(PropPersistModel);
  const [componentList, setComponentList] = useState<Component[]>([]);
  const [valueData, setValueData] = useState<number>();

  useEffect(() => {
    if (!value || !value.instanceId) {
      return;
    }

    setComponentList([{ id: value.componentId, name: value.componentName } as Component]);
    setValueData(value.componentId);

    if (componentList.length) {
      setTimeout(() => {
        setComponentList(componentList);
      }, 100);
    }

  }, [value]);

  const onChange = (valueId) => {
    setValueData(valueId);

    const rawInstance = {
      id: parentInstanceId,
      componentId: valueId,
      oldChildId: value.instanceId
    } as ComponentInstance;

    propPersistModel.addChildComponentInstance(rawInstance).then((data) => {
      _onChange({
        instanceId: data.id,
        componentName: data.component.name,
        componentId: data.component.id,
      });
    })
  }

  const onFocus = () => {
    if (componentList.length > 1) {
      return
    }

    request(APIPath.component_list).then(({ data }) => {
      setComponentList(data);
    })
  }

  const filterOption = (input, option) => {
    return option.children.includes(input)
  }

  return (<Select className={styles.select} filterOption={filterOption}
    showSearch value={valueData} onChange={onChange} onFocus={onFocus} >
    {componentList.map((item) => {
      return (<Select.Option key={item.id} value={item.id} disabled={item.id === value?.componentId}>{item.name}</Select.Option>)
    })}
  </Select>)
}

export default ComponentSelect;