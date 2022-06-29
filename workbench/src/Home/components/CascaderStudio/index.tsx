import { CloseOutlined, SettingFilled, SettingOutlined } from '@ant-design/icons';
import StudioModel from '@model/StudioModel';
import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import { Button, Col, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import PropBlockStudio from '../PropBlockStudio';
import PropGroupStudio from '../PropGroupStudio';
import styles from './index.module.less';


type PropsType = {
  item: PropItem
}

const CascaderStudio: React.FC<PropsType> = ({ item: propItem }) => {
  const [studioModel] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');
  const [editMode, setEditMode] = useState(false);

  const templateBlock = propItem.templateBlock!;

  const containerRef = useRef<HTMLDivElement>({} as any);

  const propGroup = propItem.valueOfGroup!;

  useEffect(() => {
    containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' });
  }, []);

  const switchEditMode = () => {
    // 从设置转换为配置
    if (!editMode) {
      propGroup.propBlockList.forEach((block) => {
        const formInstance = workbenchModel.blockFormInstanceMap.get(block.id);
        const formData = formInstance.getFieldsValue();
        block.propItemList.forEach((item) => {
          item.defaultValue = formData[item.propKey];
        });
      })
    } else {
      studioModel.pushHandUpPropItem(propItem);
    }

    setEditMode(mode => !mode);
  }

  return <div className={styles.container} ref={containerRef}>
    <div className={`${styles.header} ${editMode ? styles.editMode : ''}`}>
      <Row>
        <Col span={5} >
          <Button type="link" icon={<CloseOutlined />} onClick={() => studioModel.popHandUpPropItem(propItem)}></Button>
        </Col>
        <Col span={16} style={{ textAlign: 'center' }}>
          {propItem.label}
        </Col>
        <Col span={3} style={{ textAlign: 'right' }} >
          {
            propItem.type === 'List' && workbenchModel.stageMode &&
            (<Button type="link" icon={editMode ? <SettingFilled /> : <SettingOutlined />} onClick={() => switchEditMode()}></Button>)
          }
        </Col>
      </Row>
    </div>
    <div className={styles.content} hidden={propItem.type !== 'List'}>
      {editMode ? <PropBlockStudio templateMode block={templateBlock} /> : <PropGroupStudio templateBlock={templateBlock} group={propGroup} />}
    </div>

    <div className={styles.content} hidden={propItem.type !== 'Item'}>
      <PropBlockStudio noWrapMode block={propItem.directBlock!} />
    </div>
  </div>
}

export default CascaderStudio;