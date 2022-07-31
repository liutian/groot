import { CloseOutlined } from '@ant-design/icons';
import { PropItemType } from '@grootio/common';
import PropHandleModel from '@model/PropHandleModel';
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
  const propGroup = propItem.childGroup;
  const containerRef = useRef<HTMLDivElement>({} as any);

  useEffect(() => {
    containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' });
  }, []);

  const renderContent = () => {
    if (propItem.type === PropItemType.Flat) {
      return <PropBlockPane noWrapMode block={propItem.childGroup.propBlockList[0]} />;
    } else {
      return <PropGroupPane group={propGroup} />;
    }
  }

  return <div className={styles.container} ref={containerRef}>
    <div className={`${styles.header} ${propGroup.templateDesignMode ? styles.templateDesignMode : ''} clearfix`}>
      <div className="pull-left">
        <Button type="link" icon={<CloseOutlined />} onClick={() => propHandleModel.popPropItemStack(propItem)}></Button>
      </div>
      <div className={styles.headerContent}>
        {propItem.label}
      </div>
      <div className="pull-right">

      </div>
    </div>

    <div className={styles.content} >
      {renderContent()}
    </div>

  </div>
}

export default SubPropPane;