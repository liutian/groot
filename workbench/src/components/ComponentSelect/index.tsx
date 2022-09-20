import { AimOutlined } from '@ant-design/icons';
import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import { Button, Select, SelectProps } from 'antd';
import { APIPath } from 'api/API.path';
import request from '@util/request';
import { useEffect, useState } from 'react';
import styles from './index.module.less';

type PropType = {
  value?: ComponentInstance,
  onChange?: (newValue: ComponentInstance) => void;
  parentInstanceId?: number,
} & SelectProps<number, any>;

const ComponentSelect: React.FC<PropType> = ({ value: _valueObj, onChange: _onChange, parentInstanceId, ...resetProps }) => {
  const [workbenchModel] = useModel(WorkbenchModel);
  const [componentList, setComponentList] = useState<{ id: number, name: string, componentId: number }[]>([]);
  const [valueNum, setValueNum] = useState<number>();

  useEffect(() => {
    if (!_valueObj) {
      return;
    }

    setComponentList([_valueObj as any]);
    setValueNum(_valueObj.id);

    if (componentList.length) {
      setTimeout(() => {
        setComponentList(componentList);
      }, 100);
    }
  }, [_valueObj]);

  const onChange = (valueId) => {
    setValueNum(valueId);

    const rawInstance = {
      id: parentInstanceId,
      componentId: valueId,
      oldChildId: _valueObj?.id
    } as ComponentInstance;

    request(APIPath.componentInstance_addChild, rawInstance).then(({ data }) => {
      _onChange({
        id: data.id,
        name: data.name,
        componentId: data.componentId,
        componentVersionId: data.componentVersionId
      } as any);
    })
  }

  const onFocus = () => {
    if (!componentList.length || (componentList.length === 1 && componentList[0].id === _valueObj.id)) {
      request(APIPath.component_list, { container: false }).then(({ data }) => {
        setComponentList(data);
      })
    }
  }

  const filterOption = (input, option) => {
    return option.children.includes(input)
  }

  return <div className={styles.container} >
    <Select className={styles.select} filterOption={filterOption}
      showSearch value={valueNum} onChange={onChange} onFocus={onFocus} {...resetProps}>
      {componentList.map((item) => {
        return (<Select.Option key={item.id} value={item.id} disabled={item.id === _valueObj?.componentId}>{item.name}</Select.Option>)
      })}
    </Select>

    <Button className={styles.suffix} disabled={resetProps.disabled} onClick={() => {
      workbenchModel.switchComponentInstance(_valueObj.id)
    }}>
      <AimOutlined />
    </Button>
  </div>
}

export default ComponentSelect;