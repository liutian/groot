import WorkbenchModel from '@model/WorkbenchModel';
import { useModel } from '@util/robot';
import { Button } from 'antd';
import { useState } from 'react';
import styles from './index.module.less';

const SideBar: React.FC = () => {
  const [openPanel, setOpenPanel] = useState(false);
  const [workbenchModel] = useModel(WorkbenchModel);
  const [activeKey, setActiveKey] = useState('component-list');

  const menuOnClick = (key: string) => {
    if (key !== activeKey) {
      setActiveKey(key);
      setOpenPanel(true);
      workbenchModel.setContainerCssVar('--side-bar-width', 'var(--side-bar-max-width)');
    } else {
      setOpenPanel(openPanel => {
        if (openPanel) {
          workbenchModel.setContainerCssVar('--side-bar-width', 'var(--side-bar-min-width)');
        } else {
          workbenchModel.setContainerCssVar('--side-bar-width', 'var(--side-bar-max-width)');
        }
        return !openPanel;
      });
    }
  }

  return <div className={styles.container}>
    <div className={styles.barContainner}>
      {
        workbenchModel.viewConfig.sidebar.map((item) => {
          return (<Button key={item.key} className={styles.menuItem}
            onClick={() => menuOnClick(item.key)} type={activeKey === item.key ? 'link' : 'text'}>
            {item.icon}
          </Button>)
        })
      }
    </div>

    {
      openPanel && (
        <div className={styles.panelContainer}>
          {workbenchModel.viewConfig.sidebar.find(item => item.key === activeKey).view}
        </div>
      )
    }

  </div>
}


export default SideBar;