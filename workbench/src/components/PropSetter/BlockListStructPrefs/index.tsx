import { Button, Checkbox, Space } from "antd"
import { useState } from "react"
import { PropBlock, PropItem, useModel } from "@grootio/common";

import PropPersistModel from "@model/PropPersistModel"

import styles from './index.module.less';

type PropsType = {
  block: PropBlock
}
const BlockListStructPrefs: React.FC<PropsType> = ({ block: propBlock }) => {
  const [, refresh] = useState(0);
  const propPersistModel = useModel(PropPersistModel);

  const [prefsBlock] = useState(() => {
    return propBlock.propItemList[0].childGroup.propBlockList;
  })

  const [checkedSet] = useState<Set<number>>(() => {
    return new Set(propBlock.listStructData);
  });

  const checkboxChange = (item: PropItem) => {
    if (checkedSet.has(item.id)) {
      checkedSet.delete(item.id);
    } else {
      checkedSet.add(item.id);
    }
    refresh((c) => ++c);
  }


  return <div className={styles.container}>
    {
      prefsBlock.map((block) => {
        return (<div key={block.id}>
          <h4>{block.name}</h4>
          <div style={{ marginBottom: '10px' }}>
            {
              block.propItemList.map((propItem) => {
                return <Space key={propItem.id}>
                  <Checkbox value={propItem.id}
                    onChange={() => checkboxChange(propItem)}
                    checked={checkedSet.has(propItem.id)}>
                    {propItem.label}
                  </Checkbox>
                </Space>
              })
            }
          </div>
        </div>)
      })
    }
    <div>
      <Button type="primary" onClick={() => propPersistModel.saveBlockListPrimaryItem(propBlock, [...checkedSet])}>保存</Button>
    </div>
  </div >
}

export default BlockListStructPrefs;