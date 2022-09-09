import { AimOutlined } from '@ant-design/icons';
import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import { Button, Select, SelectProps } from 'antd';
import { serverPath } from 'config';
import { useEffect, useState } from 'react';
import styles from './index.module.less';

type PropType = {
  value?: ComponentInstance,
  onChange?: (newValue: ComponentInstance) => void;
  parentInstanceId?: number,
} & SelectProps<number, any>;

const ComponentSelect: React.FC<PropType> = ({ value: _valueObj, onChange: _onChange, parentInstanceId, ...resetProps }) => {
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
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
    }

    fetch(`${serverPath}/component-instance/add-child`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rawInstance)
    }).then(res => res.json()).then(({ data: newChildInstance }: { data: ComponentInstance }) => {
      _onChange({
        id: newChildInstance.id,
        name: newChildInstance.name,
        componentId: newChildInstance.componentId,
        componentVersionId: newChildInstance.componentVersionId
      } as any);
    })
  }

  const onFocus = () => {
    if (!componentList.length || (componentList.length === 1 && componentList[0].id === _valueObj.id)) {
      fetch(`${serverPath}/component/list?container=false`).then(res => res.json()).then(({ data }: { data: any[] }) => {
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