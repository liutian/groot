import { AimOutlined } from '@ant-design/icons';
import { Button, Select, SelectProps } from 'antd';
import { serverPath } from 'config';
import { useEffect, useState } from 'react';
import styles from './index.module.less';

type PropType = {
  value?: Component,
  onChange?: (newValue: Component) => void;
} & SelectProps<number, Component[]>;

const ComponentSelect: React.FC<PropType> = ({ value: _valueObj, onChange: _onChange, ...resetProps }) => {
  const [list, setList] = useState<Component[]>([]);
  const [valueNum, setValueNum] = useState<number>();

  useEffect(() => {
    if (_valueObj) {
      setList([_valueObj]);
      setValueNum(_valueObj.id);
    } else {
      setList([]);
      setValueNum(null);
    }
  }, [_valueObj]);

  const onChange = (valueId) => {
    const hitValue = list.find(v => v.id === valueId);
    setValueNum(valueId);
    _onChange(hitValue);
  }

  const onFocus = () => {
    if (!list.length || (list.length === 1 && list[0] === _valueObj)) {
      fetch(`${serverPath}/component/list?container=false`).then(res => res.json()).then(({ data: list }: { data: Component[] }) => {
        setList(list);
      })
    }
  }

  const filterOption = (input, option) => {
    return option.children.includes(input)
  }

  return <div className={styles.container} >
    <Select className={styles.select} filterOption={filterOption}
      showSearch value={valueNum} onChange={onChange} onFocus={onFocus} {...resetProps}>
      {list.map((item) => {
        return (<Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)
      })}
    </Select>

    <Button className={styles.suffix} disabled={resetProps.disabled}>
      <AimOutlined />
    </Button>
  </div>
}

export default ComponentSelect;