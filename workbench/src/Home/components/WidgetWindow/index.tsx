import { CloseOutlined, ExpandAltOutlined, LineOutlined } from '@ant-design/icons';
import { Space, Tabs } from 'antd';
import { HTMLAttributes } from 'react';

// import styles from './index.module.less';

const tabBarStyles = {
  padding: '0 15px',
  borderBottom: 'solid 1px #dedede'
}

const WidgetWindow: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {

  return <div {...props}>
    <Tabs tabBarStyle={tabBarStyles} tabBarExtraContent={
      <Space>
        <LineOutlined />
        <ExpandAltOutlined />
        <CloseOutlined />
      </Space>
    }>
      <Tabs.TabPane tab="Tab 1" key="1">1</Tabs.TabPane>
      <Tabs.TabPane tab="Tab 2" key="2">2</Tabs.TabPane>
      <Tabs.TabPane tab="Tab 3" key="3">3</Tabs.TabPane>
      <Tabs.TabPane tab="Tab 4" key="4">4</Tabs.TabPane>
    </Tabs>
    {/* {model.manualMode ? <Editor onContentChange={notifyIframe} defaultContent={PageDataRef.current.component.codeMetaData} /> : null} */}
  </div>
}

export default WidgetWindow;