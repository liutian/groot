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

const SubStudio: React.FC<PropsType> = ({ item: propItem }) => {
  const [studioModel] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');
  const [templateMode, setTemplateMode] = useState(false);
  const templateBlock = propItem.templateBlock;
  const propGroup = propItem.valueOfGroup;
  const containerRef = useRef<HTMLDivElement>({} as any);

  useEffect(() => {
    containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' });
  }, []);

  const switchMode = () => {
    // 从配置转为模版模式
    if (templateMode) {
      studioModel.popPropItemStack(propItem, false);
    } else {
      // propGroup.propBlockList.forEach((block) => {
      //   const formInstance = workbenchModel.blockFormInstanceMap.get(block.id);
      //   const formData = formInstance.getFieldsValue();
      //   block.propItemList.forEach((item) => {
      //     item.defaultValue = formData[item.propKey];
      //   });
      // })
    }

    setTemplateMode(mode => !mode);
  }

  const renderContent = () => {
    if (propItem.type === 'List') {
      if (templateMode) {
        return <PropBlockStudio templateMode block={templateBlock} />;
      } else {
        return <PropGroupStudio templateBlock={templateBlock} group={propGroup} />;
      }
    } else if (propItem.type === 'Item') {
      return <PropBlockStudio noWrapMode block={propItem.directBlock!} />;
    } else {
      return null;
    }
  }

  return <div className={styles.container} ref={containerRef}>
    <div className={`${styles.header} ${templateMode ? styles.templateMode : ''} clearfix`}>
      <div className="pull-left">
        <Button type="link" icon={<CloseOutlined />} onClick={() => studioModel.popPropItemStack(propItem, true)}></Button>
      </div>
      <div className={styles.headerContent}>
        {propItem.label}
      </div>
      <div className="pull-right">
        {
          propItem.type === 'List' && workbenchModel.stageMode &&
          (<Button type="link" icon={templateMode ? <SettingFilled /> : <SettingOutlined />} onClick={() => switchMode()}></Button>)
        }
      </div>
    </div>

    <div className={styles.content} >
      {renderContent()}
    </div>

  </div>
}

export default SubStudio;