import { CloseOutlined, SettingFilled, SettingOutlined } from '@ant-design/icons';
import StudioModel from '@model/StudioModel';
import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import { Button } from 'antd';
import { useEffect, useRef } from 'react';

import PropBlockStudio from '../PropBlockStudio';
import PropGroupStudio from '../PropGroupStudio';
import styles from './index.module.less';


type PropsType = {
  item: PropItem
}

const SubStudio: React.FC<PropsType> = ({ item: propItem }) => {
  const [studioModel] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');
  const templateBlock = propItem.templateBlock;
  const propGroup = propItem.valueOfGroup;
  const containerRef = useRef<HTMLDivElement>({} as any);

  useEffect(() => {
    containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' });
  }, []);

  const renderContent = () => {
    if (propItem.type === 'List') {
      if (propGroup.templateBlockDesignMode) {
        return <PropBlockStudio templateMode block={templateBlock} />;
      } else {
        return <PropGroupStudio templateBlock={templateBlock} group={propGroup} />;
      }
    } else if (propItem.type === 'Item') {
      return <PropBlockStudio noWrapMode block={propItem.directBlock} />;
    } else {
      return null;
    }
  }

  return <div className={styles.container} ref={containerRef}>
    <div className={`${styles.header} ${propGroup.templateBlockDesignMode ? styles.templateDesignMode : ''} clearfix`}>
      <div className="pull-left">
        <Button type="link" icon={<CloseOutlined />} onClick={() => studioModel.popPropItemStack(propItem)}></Button>
      </div>
      <div className={styles.headerContent}>
        {propItem.label}
      </div>
      <div className="pull-right">
        {
          propItem.type === 'List' && workbenchModel.designMode &&
          (<Button type="link" icon={propGroup.templateBlockDesignMode ? <SettingFilled /> : <SettingOutlined />}
            onClick={() => studioModel.toggleTemplateBlockDesignMode(propGroup)}></Button>)
        }
      </div>
    </div>

    <div className={styles.content} >
      {renderContent()}
    </div>

  </div>
}

export default SubStudio;