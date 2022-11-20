import PluginView from '@components/PluginView';
import WorkbenchModel from '@model/WorkbenchModel';
import { WorkbenchEvent } from '@util/common';
import { useModel } from '@util/robot';
import { Button } from 'antd';
import React, { useEffect } from 'react';
import { ReactNode, useState } from 'react';
import styles from './index.module.less';

const SideBar: React.FC = () => {
  const [openPanel, setOpenPanel] = useState(false);
  const [workbenchModel] = useModel(WorkbenchModel);
  const [activeKey, setActiveKey] = useState('');
  const [activeComponent, setActiveComponent] = useState<ReactNode>();

  useEffect(() => {
    menuOnClick('component-list')
  }, []);

  function menuOnClick(currentKey: string) {
    workbenchModel.dispatchEvent(new CustomEvent(WorkbenchEvent.ViewportSizeChange));
    if (currentKey !== activeKey) {
      setActiveKey(currentKey);
      setOpenPanel(true);
      const config = workbenchModel.viewConfig.sidebar.find(item => item.key === currentKey);
      if (React.isValidElement(config.view)) {
        setActiveComponent(config.view);
      } else {
        setActiveComponent(<PluginView config={config.view} />);
      }

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
          {activeComponent}
        </div>
      )
    }

  </div>
}


export default SideBar;