import { CloseOutlined, DragOutlined, FullscreenExitOutlined, FullscreenOutlined, LineOutlined } from '@ant-design/icons';
import { Button, Tabs, Typography } from 'antd';
import { HTMLAttributes, ReactNode, useEffect, useRef } from 'react';
import WorkbenchModel from '@model/WorkbenchModel';

import styles from './index.module.less';
import { useModel } from '@util/robot';
import MouseFollow from 'components/MouseFollow';

const tabBarStyles = {
  padding: '0 15px',
  borderBottom: 'solid 1px #dedede'
}

const WidgetWindow: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const [workbenchModel, updateAction] = useModel(WorkbenchModel);
  const containerRef = useRef<HTMLDivElement>({} as any);

  let middleBtn: ReactNode;

  if (workbenchModel.widgetWindowRect === 'full') {
    middleBtn = <Button type="text" icon={<FullscreenExitOutlined />} onClick={() => updateAction(() => workbenchModel.widgetWindowRect = 'normal')} />;
  } else if (workbenchModel.widgetWindowRect === 'normal') {
    middleBtn = <>
      <Button type="text" icon={<FullscreenOutlined onClick={() => updateAction(() => workbenchModel.widgetWindowRect = 'full')} />} />
      <MouseFollow
        start={() => {
          document.getElementById(workbenchModel.iframeDragMaskId).classList.add('show');
          return containerRef.current!.getBoundingClientRect();
        }}
        move={(x, y, originData) => {
          const top = originData.top + y;
          const left = originData.left + x;
          containerRef.current!.style.top = `${top}px`;
          containerRef.current!.style.left = `${left}px`;
        }}
        end={() => {
          document.getElementById(workbenchModel.iframeDragMaskId).classList.remove('show');
        }}
      >
        <Button type="text" icon={<DragOutlined />} />;
      </MouseFollow>
    </>
  }

  useEffect(() => {
    if (workbenchModel.widgetWindowRect === 'normal') {
      containerRef.current!.style.top = '';
      containerRef.current!.style.left = '';
    }
  }, [workbenchModel.widgetWindowRect]);

  useEffect(() => {
    const originOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originOverflow;
    }
  }, []);

  const renderTabs = () => {
    return <Tabs tabBarStyle={tabBarStyles} tabBarExtraContent={
      <>
        <Button type="text" icon={<LineOutlined />} onClick={() => updateAction(() => workbenchModel.widgetWindowRect = 'min')} />

        {middleBtn}

        <Button type="text" icon={<CloseOutlined />} onClick={() => updateAction(() => workbenchModel.widgetWindowRect = 'none')} />
      </>
    }>
      <Tabs.TabPane tab="Tab 1" key="1">1</Tabs.TabPane>
      <Tabs.TabPane tab="Tab 2" key="2">2</Tabs.TabPane>
      <Tabs.TabPane tab="Tab 3" key="3">3</Tabs.TabPane>
      <Tabs.TabPane tab="Tab 4" key="4">4</Tabs.TabPane>
    </Tabs>
  }

  return <div {...props} ref={containerRef} className={`${styles.widgetWindow} ${typeof workbenchModel.widgetWindowRect === 'string' ? workbenchModel.widgetWindowRect : ''}`}>
    {
      workbenchModel.widgetWindowRect !== 'min' ? renderTabs() : <>
        <Typography.Text ellipsis className={styles.minText} onClick={() => updateAction(() => workbenchModel.widgetWindowRect = 'normal')}>
          组件源码
        </Typography.Text>
        <Button className={styles.actionItem} type="text" icon={<FullscreenOutlined />} onClick={() => updateAction(() => workbenchModel.widgetWindowRect = 'normal')} />
        <Button className={styles.actionItem} type="text" icon={<CloseOutlined />} onClick={() => updateAction(() => workbenchModel.widgetWindowRect = 'none')} />
      </>
    }
  </div>
}

export default WidgetWindow;