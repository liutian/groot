import { Button, Collapse, Dropdown, Input, Menu, Space, Tabs, Typography } from "antd";
import { useRef, useState } from "react";
import StudioForm from "../StudioForm";
import { VerticalAlignTopOutlined, FolderAddOutlined, EditOutlined, VerticalAlignBottomOutlined, DeleteOutlined, CaretRightOutlined, PlusOutlined } from '@ant-design/icons';
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableTabNode from "../DraggableTabNode";
import { useRefresh } from "util/hooks";
import { uuid } from "util/utils";
import GroupSetting, { GroupSettingDataType } from "../GroupSetting";
// import styles from './index.module.less';

function Studio() {
  const refresh = useRefresh();
  const [settingMode,] = useState(true);
  const [codeMetaStudioData] = useState(initData as CodeMetaStudioType);
  const tabActiveRef = useRef('');
  const [currGroupSetting, setCurrGroupSetting] = useState<GroupSettingDataType | null>(null);

  const getData = () => {
    codeMetaStudioData.propGroups.forEach((group) => {
      group.propBlocks.forEach((block) => {
        const values = block.formInstanceRef!.current.getFieldsValue();
        console.log('values', values);
      })
    })
  }

  const renderBlocks = (group: CodeMetaPropGroup) => {
    const delBlock = (groupIndex: number) => {
      group.propBlocks.splice(groupIndex, 1);
      refresh();
    }

    const moveBlock = (originIndex: number, up: boolean) => {
      const [moveBlock] = group.propBlocks.splice(originIndex, 1);
      if (up) {
        group.propBlocks.splice(originIndex - 1, 0, moveBlock!);
      } else {
        group.propBlocks.splice(originIndex + 1, 0, moveBlock!);
      }
      refresh();
    }

    const renderBlockSetting = (index: number) => {
      if (!settingMode) return null;

      return (<Space size="small">
        <Typography.Link disabled={index === 0} onClick={(e) => {
          e.stopPropagation();
          moveBlock(index, true);
        }}>
          <VerticalAlignTopOutlined />
        </Typography.Link>
        <Typography.Link disabled={index === group.propBlocks.length - 1} onClick={(e) => {
          e.stopPropagation();
          moveBlock(index, false);
        }}>
          <VerticalAlignBottomOutlined />
        </Typography.Link>
        <Typography.Link disabled={index === 0 && group.propBlocks.length === 1} onClick={(e) => {
          e.stopPropagation();
          delBlock(index);
        }} >
          <DeleteOutlined />
        </Typography.Link>
      </Space>)
    }

    const renderBlockTitle = (block: CodeMetaPropBlock) => {
      const editMode = (block as any)._editMode;
      const inputRef = { current: null };

      return <>
        <Input maxLength={20} hidden={!editMode} ref={inputRef} style={{ width: '15em' }} size="small" value={block.title}
          onBlur={() => {
            (block as any)._editMode = false;
            refresh();
          }}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            block.title = e.target.value;
            refresh();
          }} />

        <Space hidden={editMode}>
          <span style={{ fontWeight: '900', color: '#555' }}>{block.title}</span>
          <a hidden={!settingMode} onClick={(e) => {
            e.stopPropagation();
            (block as any)._editMode = true;
            refresh();
            const inputEle = inputRef.current as any;
            setTimeout(() => {
              if (inputEle) {
                inputEle.focus();
              }
            }, 100)
          }}><EditOutlined /></a>
        </Space>
      </>
    }

    return (<Collapse bordered={false} expandIconPosition="right" expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
      {
        group.propBlocks.map((block, blockIndex) => {
          return (<Collapse.Panel header={renderBlockTitle(block)} key={blockIndex} extra={renderBlockSetting(blockIndex)}>
            <StudioForm settingMode={settingMode} items={block.propItems} ref={block.formInstanceRef} />
          </Collapse.Panel>)
        })
      }
    </Collapse>)
  }

  const renderGroupSettingModal = () => {
    const onFinish = (result: GroupSettingDataType) => {
      if (result.type === 'add') {
        codeMetaStudioData.propGroups.push({ ...result.group });
      } else {
        codeMetaStudioData.propGroups.splice(result.index!, 1, { ...result.group });
      }
      setCurrGroupSetting(null);
    }

    return (<GroupSetting data={currGroupSetting} finish={onFinish} />)
  }

  const moveTabNode = (dragKey: string, hoverKey: string) => {
    if (dragKey === hoverKey) {
      return;
    }

    const groups = codeMetaStudioData.propGroups;

    const drag = groups.find(g => g.key === dragKey)!;
    const hoverIndex = groups.findIndex(g => g.key === hoverKey);
    const dragIndex = groups.findIndex(g => g.key === dragKey);
    const currentIndex = groups.findIndex(g => g.key === tabActiveRef.current);

    groups.splice(hoverIndex, 0, drag);

    if (hoverIndex < dragIndex) {

      groups.splice(dragIndex + 1, 1);
      if (currentIndex >= hoverIndex && currentIndex < dragIndex) {
        tabActiveRef.current = groups[currentIndex + 1]?.key!;
      } else if (currentIndex === dragIndex) {
        tabActiveRef.current = hoverKey;
      }
    } else {
      if (currentIndex === dragIndex && currentIndex < hoverIndex) {
        tabActiveRef.current = groups[currentIndex - 1]?.key!;
      } else if (currentIndex === dragIndex) {
        tabActiveRef.current = groups[hoverIndex - 1]?.key!;
      }
      groups.splice(dragIndex, 1);
    }
    refresh();
  }

  const renderTabBar = (props: any, DefaultTabBar: React.ElementType) => (
    <DefaultTabBar {...props}>
      {(node: React.ReactElement) => (
        <DraggableTabNode key={node.key} nodeKey={node.key as string} moveNode={moveTabNode}>
          {node as any}
        </DraggableTabNode>
      )}
    </DefaultTabBar>
  );

  const renderTabBarItem = (group: CodeMetaPropGroup, groupIndex: number) => {
    const delGroup = () => {
      const index = codeMetaStudioData.propGroups.findIndex(g => g.key === group.key);
      codeMetaStudioData.propGroups.splice(index, 1);
      if (tabActiveRef.current === group.key) {
        tabActiveRef.current = codeMetaStudioData.propGroups[0]!.key;
      }
      refresh();
    }

    const menus = (
      <Menu>
        <Menu.Item disabled={codeMetaStudioData.propGroups.length === 0} onClick={() => delGroup()}>删除</Menu.Item>
        <Menu.Item>复制</Menu.Item>
        <Menu.Item onClick={(e) => {
          setCurrGroupSetting({
            type: 'edit',
            group: JSON.parse(JSON.stringify(group)),
            index: groupIndex
          });
          e.domEvent.stopPropagation();
        }}>配置</Menu.Item>
      </Menu>
    );

    return <Dropdown overlayStyle={{ minWidth: '5em' }} overlay={menus} trigger={['contextMenu']}>
      <div>{group.title}</div>
    </Dropdown>
  }

  /////////////////////////////////////////////////////////////////////////////
  return <>
    <Button type="primary" onClick={() => getData()}>保存</Button>
    <DndProvider backend={HTML5Backend}>
      <Tabs type="card" size="small" className="studio-tabs" activeKey={tabActiveRef.current}
        onChange={activeKey => {
          if (activeKey === '__add') {
            setCurrGroupSetting({ type: 'add', group: { title: 'www', key: uuid(), propBlocks: [] } as CodeMetaPropGroup });
            return;
          }

          const activeItem = codeMetaStudioData.propGroups.find(g => g.key === activeKey);
          if (activeItem) {
            tabActiveRef.current = activeKey;
            refresh();
          }
        }}
        renderTabBar={renderTabBar} >
        {
          [...codeMetaStudioData.propGroups, ({ key: '__add' } as CodeMetaPropGroup)].map((group, groupIndex) => {
            if (group.key === '__add') {
              return (<Tabs.TabPane key={group.key} tab={<PlusOutlined />}></Tabs.TabPane>)
            } else {
              return (<Tabs.TabPane closable={false} tab={renderTabBarItem(group, groupIndex)} key={group.key}>
                <div style={{ textAlign: 'center' }} hidden={!settingMode}>
                  <Button type="link" icon={<FolderAddOutlined />} onClick={() => {
                    group.propBlocks.push({
                      key: uuid(),
                      title: '区块' + group.propBlocks.length,
                      propItems: [],
                      formInstanceRef: { current: null }
                    });
                    refresh();
                  }}>添加</Button>
                </div>

                {renderBlocks(group)}
              </Tabs.TabPane>)
            }
          })
        }
      </Tabs>
    </DndProvider>
    {renderGroupSettingModal()}
  </>
}

const initData = {
  name: '测试',
  propGroups: [{
    key: 'aaa',
    title: '测试',
    propBlocks: [
      {
        key: '111',
        title: '测试',
        formInstanceRef: { current: null },
        propItems: [{
          key: 'demo',
          label: 'label',
          name: 'xxx',
          type: 'input'
        }]
      }, {
        key: '222',
        title: '测试',
        formInstanceRef: { current: null },
        propItems: [{
          key: 'demo',
          label: 'label',
          name: 'xxx',
          type: 'date-picker'
        }]
      }
    ]
  }]
};
export default Studio;