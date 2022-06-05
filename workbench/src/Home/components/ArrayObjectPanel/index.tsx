import { LeftOutlined, SettingFilled, SettingOutlined } from '@ant-design/icons';
import StudioModel from '@model/StudioModel';
import { useModel } from '@util/robot';
import { Badge, Button, Col, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import PropBlockStudio from '../PropBlockStudio';
import PropGroupStudio from '../PropGroupStudio';
import styles from './index.module.less';


type PropsType = {
  item: PropItem
}

const ArrayObjectPanel: React.FC<PropsType> = ({ item: propItem }) => {
  const [model] = useModel<StudioModel>('studio');
  const [settingMode, setSettingMode] = useState(false);

  const templateBlock = propItem.templateBlock!;

  const preTemplateBlockRef = useRef(JSON.stringify(templateBlock));

  const propGroup = propItem.valueOfGroup!;

  useEffect(() => {
    model.innerTempPropGroupMap.set(propGroup.id, propGroup);
    return () => {
      model.innerTempPropGroupMap.delete(propGroup.id);
    }
  }, [])

  const switchSettingMode = () => {
    // 从设置转换为配置
    if (settingMode) {
      const formInstance = model.blockFormInstanceMap.get(templateBlock.id)!;
      const defaultData = formInstance.getFieldsValue();

      templateBlock.propItemList.forEach((item) => {
        const itemValue = defaultData[item.propKey];
        item.defaultValue = itemValue;
      })

      if (JSON.stringify(templateBlock) !== preTemplateBlockRef.current) {
        preTemplateBlockRef.current = JSON.stringify(templateBlock)
        propGroup.propBlockList = [];
      }
    } else {
      propGroup.propBlockList.forEach((block) => {
        const formInstance = model.blockFormInstanceMap.get(block.id);
        const formData = formInstance?.getFieldsValue();
        block.propItemList.forEach((item) => {
          item.defaultValue = formData[item.propKey];
        });
      })
    }

    setSettingMode(mode => !mode);
  }

  const closePanel = () => {
    model.popHandUpPropItem(propGroup, templateBlock);
  }

  return <div className={styles.container}>
    <div className={styles.header}>
      <Row>
        <Col span={5} >
          <Button type="link" disabled={settingMode} icon={<LeftOutlined />} onClick={closePanel}></Button>
          {model.handUpPropItemStack.length > 1 ? <Badge count={model.handUpPropItemStack.length} color="#aaa"></Badge> : null}
        </Col>
        <Col span={16} style={{ textAlign: 'center' }}>
          {propItem.label}
        </Col>
        <Col span={3} style={{ textAlign: 'right' }}>
          <Button type="link" icon={settingMode ? <SettingFilled /> : <SettingOutlined />} onClick={() => switchSettingMode()}></Button>
        </Col>
      </Row>
    </div>
    <div className={styles.content}>
      {settingMode ? <PropBlockStudio templateMode block={templateBlock} /> : <PropGroupStudio innerTemplateBlock={templateBlock} group={propGroup} />}
    </div>
  </div>
}

export default ArrayObjectPanel;