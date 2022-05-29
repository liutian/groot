import { CloseOutlined, FullscreenExitOutlined, FullscreenOutlined, LineOutlined } from '@ant-design/icons';
import { Button, Tabs, Typography } from 'antd';
import { HTMLAttributes, ReactNode } from 'react';
import WorkbenchModel from '@model/Workbench';

import styles from './index.module.less';
import { useModel } from '@util/robot';

const tabBarStyles = {
  padding: '0 15px',
  borderBottom: 'solid 1px #dedede'
}

const WidgetWindow: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const [model, updateAction] = useModel<WorkbenchModel>('workbench');

  let middleBtn: ReactNode;

  if (model.widgetWindowRect === 'full') {
    middleBtn = <Button type="text" icon={<FullscreenExitOutlined />} onClick={() => updateAction(() => model.widgetWindowRect = 'normal')} />;
  } else if (model.widgetWindowRect === 'normal') {
    middleBtn = <Button type="text" icon={<FullscreenOutlined onClick={() => updateAction(() => model.widgetWindowRect = 'full')} />} />;
  }

  const renderTabs = () => {
    return <Tabs tabBarStyle={tabBarStyles} tabBarExtraContent={
      <>
        <Button type="text" icon={<LineOutlined />} onClick={() => updateAction(() => model.widgetWindowRect = 'min')} />

        {middleBtn}

        <Button type="text" icon={<CloseOutlined />} onClick={() => updateAction(() => model.widgetWindowRect = 'none')} />
      </>
    }>
      <Tabs.TabPane tab="Tab 1" key="1">1</Tabs.TabPane>
      <Tabs.TabPane tab="Tab 2" key="2">2</Tabs.TabPane>
      <Tabs.TabPane tab="Tab 3" key="3">3</Tabs.TabPane>
      <Tabs.TabPane tab="Tab 4" key="4">4</Tabs.TabPane>
    </Tabs>
  }

  return <div {...props} className={`${styles.widgetWindow} ${typeof model.widgetWindowRect === 'string' ? model.widgetWindowRect : ''}`}>
    {
      model.widgetWindowRect !== 'min' ? renderTabs() : <>
        <Typography.Text ellipsis className={styles.minText} onClick={() => updateAction(() => model.widgetWindowRect = 'normal')}>
          <Button type="link">组件生成源码</Button>
        </Typography.Text>
        <div>
          <Button type="text" icon={<FullscreenOutlined onClick={() => updateAction(() => model.widgetWindowRect = 'normal')} />} />
          <Button type="text" icon={<CloseOutlined />} onClick={() => updateAction(() => model.widgetWindowRect = 'none')} />
        </div>
      </>
    }

    {/* {model.manualMode ? <Editor onContentChange={notifyIframe} defaultContent={PageDataRef.current.component.codeMetaData} /> : null} */}
  </div>
}

export default WidgetWindow;