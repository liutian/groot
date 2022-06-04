import { LeftOutlined, SettingFilled, SettingOutlined } from '@ant-design/icons';
import Studio from '@model/Studio';
import { useModel } from '@util/robot';
import { Badge, Button, Col, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import StudioBlock from '../StudioBlock';
import StudioGroup from '../StudioGroup';
import styles from './index.module.less';


type PropsType = {
  item: CodeMetaStudioItem
}

const ArrayObjectPanel: React.FC<PropsType> = ({ item: studioItem }) => {
  const [model] = useModel<Studio>('studio');
  const [settingMode, setSettingMode] = useState(false);

  const templateBlock = studioItem.templateBlock!;

  const preTemplateBlockRef = useRef(JSON.stringify(templateBlock));

  const studioGroup = studioItem.valueOfGroup!;

  useEffect(() => {
    model.innerTempStudioGroupMap.set(studioGroup.id, studioGroup);
    return () => {
      model.innerTempStudioGroupMap.delete(studioGroup.id);
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
        studioGroup.propBlockList = [];
      }
    } else {
      studioGroup.propBlockList.forEach((block) => {
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
    model.popHandUpStudioItem(studioGroup, templateBlock);
  }

  return <div className={styles.container}>
    <div className={styles.header}>
      <Row>
        <Col span={5} >
          <Button type="link" disabled={settingMode} icon={<LeftOutlined />} onClick={closePanel}></Button>
          {model.handUpStudioItemStack.length > 1 ? <Badge count={model.handUpStudioItemStack.length} color="#aaa"></Badge> : null}
        </Col>
        <Col span={16} style={{ textAlign: 'center' }}>
          {studioItem.label}
        </Col>
        <Col span={3} style={{ textAlign: 'right' }}>
          <Button type="link" icon={settingMode ? <SettingFilled /> : <SettingOutlined />} onClick={() => switchSettingMode()}></Button>
        </Col>
      </Row>
    </div>
    <div className={styles.content}>
      {settingMode ? <StudioBlock templateMode block={templateBlock} /> : <StudioGroup innerTemplateBlock={templateBlock} group={studioGroup} />}
    </div>
  </div>
}

export default ArrayObjectPanel;