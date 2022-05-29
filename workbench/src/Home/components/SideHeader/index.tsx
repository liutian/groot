import { LayoutOutlined, MenuOutlined, NodeIndexOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Dropdown, Input, Menu } from "antd";
import { HTMLAttributes, useState } from "react";

import styles from './index.module.less';

const SideHeader: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  // 搜索模式
  const [searchMode, setSearchMode] = useState(false);
  // 搜索关键字
  const [searchText, setSearchText] = useState('');

  // 搜索结果
  const renderSearchOverlay = () => {
    return <Menu items={[
      {
        key: '1',
        label: `搜索结果 ${searchText}`,
      },
      {
        key: '2',
        label: `搜索结果 ${searchText}`,
      },
      {
        key: '3',
        label: `搜索结果 ${searchText}`,
      },
      {
        type: 'divider',
      },
      {
        label: `搜索结果 ${searchText}`,
        key: '4',
        disabled: true,
      },
    ]} />
  }

  // 环境切换
  const renderEnvOverlay = () => {
    return <div className={styles.envOverlay}>
      <Button type="text" icon={<NodeIndexOutlined style={{ color: 'red' }} />}></Button>
      <Button type="text" icon={<NodeIndexOutlined style={{ color: 'orange' }} />}></Button>
      <Button type="text" icon={<NodeIndexOutlined style={{ color: 'blue' }} />}></Button>
      <Button type="text" icon={<NodeIndexOutlined style={{ color: 'green' }} />}></Button>
    </div>
  }

  // 全局设置
  const renderHeaderActionsOverlay = () => {
    return <Menu items={[
      {
        key: '1',
        label: '新建组件'
      },
      {
        key: '2',
        label: '全局配置'
      },
      {
        key: '3',
        label: '全局变量'
      },
      {
        key: '4',
        label: '数据源'
      },
      {
        key: '5',
        label: '项目管理'
      },
    ]} />
  }

  return <div {...props}>
    <div className={styles.env}>
      <Dropdown overlay={renderEnvOverlay()} >
        <Button icon={<NodeIndexOutlined />} title="环境" type="text" />
      </Dropdown>
    </div>

    <div className={`${styles.title} ${searchMode ? styles.searchMode : ''}`}>
      <Dropdown overlay={renderSearchOverlay()} visible={searchMode}>
        <Input
          placeholder="输入页面地址或者组件名称"
          prefix={<LayoutOutlined />}
          suffix={
            <SyncOutlined spin />
          }
          onFocus={(e) => {
            setSearchMode(true);

            setTimeout(() => {
              (e.target as HTMLInputElement).focus();
            }, 150);
          }}
          onBlur={(e) => {
            setTimeout(() => {
              if (document.activeElement !== e.target) {
                setSearchMode(false)
              }
            }, 160);
          }}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
        />
      </Dropdown>
    </div>

    <div className={styles.actions}>
      <Dropdown overlay={renderHeaderActionsOverlay()} trigger={['click']}>
        <Button icon={<MenuOutlined />} type="text" title="全局设置" />
      </Dropdown>
    </div>
  </div>
}

export default SideHeader;