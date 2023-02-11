import { LeftOutlined } from '@ant-design/icons';
import { PropItem, PropItemType, useModel } from '@grootio/common';
import { Button } from 'antd';
import { grootStateManager } from 'context';
import { useRef } from 'react';
import BlockListStructPrefs from '../BlockListStructPrefs';


import PropBlockPane from '../PropBlockPane';
import PropGroupPane from '../PropGroupPane';
import PropHandleModel from '../PropHandleModel';
import styles from './index.module.less';


type PropsType = {
  item: PropItem
}

const SubPropPane: React.FC<PropsType> = ({ item: propItem }) => {
  const propHandleModel = useModel(PropHandleModel);
  const propGroup = propItem.childGroup;
  const containerRef = useRef<HTMLDivElement>({} as any);

  const renderContent = () => {
    if (propItem.extraUIData?.type === 'BlockListPrefs') {
      return <BlockListStructPrefs block={propItem.extraUIData.data} />
    }

    if (propItem.type === PropItemType.Flat) {
      return <PropBlockPane noWrapMode block={propItem.childGroup.propBlockList[0]}
        key={`block-${propItem.childGroup.propBlockList[0].id}-${propHandleModel.forceUpdateFormKey}`} />;
    } else {
      return <PropGroupPane group={propGroup} key={`group-${propGroup.id}-${propHandleModel.forceUpdateFormKey}`} />;
    }
  }

  return <div className={styles.container} ref={containerRef}>
    <div className={`${styles.header} ${propGroup.templateDesignMode ? styles.templateDesignMode : ''} clearfix`}>
      <div className="pull-left">
        <Button type="link" icon={<LeftOutlined />} onClick={() => propHandleModel.popPropItemFromStack(propItem)}>
          {propHandleModel.propItemStack.length - 1 || ''}
        </Button>
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