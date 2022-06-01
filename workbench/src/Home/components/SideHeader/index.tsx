import { BarsOutlined, LayoutOutlined, MenuOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Radio, Tag, Typography } from "antd";
import { HTMLAttributes, useState } from "react";

import styles from './index.module.less';

const SideHeader: React.FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  // 搜索模式
  const [searchMode, setSearchMode] = useState(false);
  // 搜索关键字
  const [searchText, setSearchText] = useState('');

  // 搜索结果
  const renderSearchOverlay = () => {
    return <div className={styles.releaseSearchOverlay}>
      <div className={styles.releaseSearchContainer}>

        <div className={styles.releaseSearchItem}>
          <div className="name">搜索结果</div>
          <div className="path">/user/list</div>
        </div>
        <div className={styles.releaseSearchItem}>
          <div className="name">搜索结果</div>
          <div className="path">/user/list</div>
        </div>
        <div className={styles.releaseSearchItem}>
          <div className="name">搜索结果</div>
          <div className="path">/user/list</div>
        </div>
      </div>

      <div className={`${styles.releaseSearchItem} ${styles.releaseSearchMoreSetting}`} >
        <div className="actions">
          <Typography.Link>
            <BarsOutlined />
          </Typography.Link>
        </div>
        <div>
          <a href="">高级查询</a>
        </div>
      </div>
    </div>
  }

  // 迭代版本列表
  const renderReleaseOverlay = () => {
    return <div className={styles.releaseOverlay}>
      <div className={styles.shortcutRelease}>
        <Radio.Group >
          <Radio.Button value="dev">dev</Radio.Button>
          <Radio.Button value="qa">qa</Radio.Button>
          <Radio.Button value="pl">pl</Radio.Button>
          <Radio.Button value="online">online</Radio.Button>
        </Radio.Group>
      </div>

      <div className={styles.recentRelease}>
        <div className={styles.releaseItem}>
          <div className={styles.releaseItemText}>v0.0.1</div>
          <div >
            <Tag>dev</Tag>
          </div>
        </div>

        <div className={`${styles.releaseItem} ${styles.releaseItemMore}`}>
          <a href="">查看所有</a>
        </div>
      </div>
    </div>
  }

  // 全局设置
  const renderSettingsOverlay = () => {
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
    <div className={styles.currRelease}>
      <Dropdown overlay={renderReleaseOverlay()} trigger={['click']} >
        <Button title="迭代" type="ghost">
          v2.2.1
        </Button>
      </Dropdown>
    </div>

    <div className={`${styles.componentTitle} ${searchMode ? styles.searchMode : ''}`}>
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

    <div className={styles.settings}>
      <Dropdown overlay={renderSettingsOverlay()} trigger={['click']}>
        <Button icon={<MenuOutlined />} type="text" title="全局设置" />
      </Dropdown>
    </div>
  </div>
}

export default SideHeader;