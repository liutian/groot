import { DeleteOutlined, DragOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Select } from 'antd';
import { useEffect, useState } from 'react';

import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import { APIPath } from 'api/API.path';
import request from '@util/request';
import styles from './index.module.less';
import { ComponentValueItemType, ComponentValueType } from '@grootio/common';

type PropType = {
  value?: ComponentValueType<ComponentInstance>,
  onChange?: (newValue: ComponentValueType<ComponentInstance>) => void;
  parentInstanceId?: number,
  prototypeMode: boolean
};

const ComponentSelect: React.FC<PropType> = ({ value: _value, onChange: _onChange, parentInstanceId, prototypeMode }) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const [valueList, setValueList] = useState<ComponentValueItemType<ComponentInstance>[]>(() => {
    if (_value?.list.length) {
      return [..._value.list]
    } else {
      return [{} as ComponentValueItemType<ComponentInstance>]
    }
  });

  if (prototypeMode) {
    return <Select disabled></Select>
  }

  const onChange = (newValue: ComponentValueItemType<ComponentInstance>, index: number) => {
    valueList[index] = newValue;
    _value.list = [...valueList];
    _onChange({ ..._value });
  }

  const add = () => {
    valueList.push({} as ComponentValueItemType<ComponentInstance>);
    setValueList([...valueList]);
  }

  const remove = (value: ComponentValueItemType<ComponentInstance>, index: number) => {
    if (value.id) {
      request(APIPath.componentInstance_remove, { instanceId: value.id }).then(() => {
        workbenchModel.removeComponentInstance(value.id);
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
              workbenchModel.switchComponentInstance(valueItem.id)
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
  value?: ComponentValueItemType<ComponentInstance>,
  onChange?: (newValue: ComponentValueItemType<ComponentInstance>) => void;
  parentInstanceId?: number,
};

const ComponentSelectItem: React.FC<ItemPropTypeItem> = ({ value, onChange: _onChange, parentInstanceId }) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const [componentList, setComponentList] = useState<Component[]>([]);
  const [valueData, setValueData] = useState<number>();

  useEffect(() => {
    if (!value || !value.id) {
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
      oldChildId: value.id
    } as ComponentInstance;

    request(APIPath.componentInstance_addChild, rawInstance).then(({ data }) => {
      if (rawInstance.oldChildId) {
        workbenchModel.removeComponentInstance(value.id);
      }
      workbenchModel.addComponentInstance(data);
      _onChange({
        id: data.id,
        componentName: data.component.name,
        componentId: data.component.id,
        extra: data
      });
    })
  }

  const onFocus = () => {
    if (componentList.length > 1) {
      return
    }

    request(APIPath.component_list, { container: false }).then(({ data }) => {
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