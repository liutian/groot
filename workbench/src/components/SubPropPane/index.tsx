import { CloseOutlined, SettingFilled, SettingOutlined } from '@ant-design/icons';
import PropHandleModel from '@model/PropHandleModel';
import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import { Button } from 'antd';
import { useEffect, useRef } from 'react';

import PropBlockPane from '../PropBlockPane';
import PropGroupPane from '../PropGroupPane';
import styles from './index.module.less';


type PropsType = {
  item: PropItem
}

const SubPropPane: React.FC<PropsType> = ({ item: propItem }) => {
  const [propHandleModel] = useModel<PropHandleModel>(PropHandleModel.modelName);
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
  const templateBlock = propItem.templateBlock;
  const propGroup = propItem.valueOfGroup;
  const containerRef = useRef<HTMLDivElement>({} as any);

  useEffect(() => {
    containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' });
  }, []);

  const renderContent = () => {
    if (propItem.type === 'List') {
      if (propGroup.templateBlockDesignMode) {
        return <PropBlockPane templateMode block={templateBlock} />;
      } else {
        return <PropGroupPane templateBlock={templateBlock} group={propGroup} />;
      }
    } else if (propItem.type === 'Item') {
      return <PropBlockPane noWrapMode block={propItem.directBlock} />;
    } else {
      return <PropGroupPane group={propGroup} />;
    }
  }

  return <div className={styles.container} ref={containerRef}>
    <div className={`${styles.header} ${propGroup.templateBlockDesignMode ? styles.templateDesignMode : ''} clearfix`}>
      <div className="pull-left">
        <Button type="link" icon={<CloseOutlined />} onClick={() => propHandleModel.popPropItemStack(propItem)}></Button>
      </div>
      <div className={styles.headerContent}>
        {propItem.label}
      </div>
      <div className="pull-right">
        {
          propItem.type === 'List' && workbenchModel.prototypeMode &&
          (<Button type="link" icon={propGroup.templateBlockDesignMode ? <SettingFilled /> : <SettingOutlined />}
            onClick={() => propHandleModel.toggleTemplateBlockDesignMode(propGroup)}></Button>)
        }
      </div>
    </div>

    <div className={styles.content} >
      {renderContent()}
    </div>

  </div>
}

export default SubPropPane;