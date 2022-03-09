import { Button, Col, Collapse, Input, Popover, Row, Space, Tabs, Typography } from "antd";
import { useState } from "react";
import StudioForm from "../StudioForm";
import { SettingOutlined, VerticalAlignTopOutlined, FolderAddOutlined, EditOutlined, VerticalAlignBottomOutlined, DeleteOutlined, CaretRightOutlined } from '@ant-design/icons';
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableTabNode from "../DraggableTabNode";
// import styles from './index.module.less';

function Studio() {
  const [settingMode,] = useState(true);
  const [codeMetaStudioData, setCodeMetaStudioData] = useState(initData as CodeMetaStudioType);

  const getData = () => {
    codeMetaStudioData.propGroups.forEach((group) => {
      group.propBlocks.forEach((block) => {
        const values = block.formInstanceRef!.current.getFieldsValue();
        console.log('values', values);
      })
    })
  }

  const viewBlocks = (group: CodeMetaPropGroup) => {
    const delBlock = (groupIndex: number) => {
      group.propBlocks.splice(groupIndex, 1);
      setCodeMetaStudioData({ ...codeMetaStudioData });
    }

    const moveBlock = (originIndex: number, up: boolean) => {
      const [moveBlock] = group.propBlocks.splice(originIndex, 1);
      if (up) {
        group.propBlocks.splice(originIndex - 1, 0, moveBlock!);
      } else {
        group.propBlocks.splice(originIndex + 1, 0, moveBlock!);
      }
      setCodeMetaStudioData({ ...codeMetaStudioData });
    }

    const viewBlockSetting = (index: number) => {
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

    const viewBlockTitle = (block: CodeMetaPropBlock) => {
      const editMode = (block as any)._editMode;
      const inputRef = { current: null };

      return <>
        <Input maxLength={20} hidden={!editMode} ref={inputRef} style={{ width: '15em' }} size="small" value={block.title}
          onBlur={() => {
            (block as any)._editMode = false;
            setCodeMetaStudioData({ ...codeMetaStudioData });
          }}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            block.title = e.target.value;
            setCodeMetaStudioData({ ...codeMetaStudioData });
          }} />

        <Space hidden={editMode}>
          <span style={{ fontWeight: '900', color: '#555' }}>{block.title}</span>
          <a hidden={!settingMode} onClick={(e) => {
            e.stopPropagation();
            (block as any)._editMode = true;
            setCodeMetaStudioData({ ...codeMetaStudioData });
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
          return (<Collapse.Panel header={viewBlockTitle(block)} key={blockIndex} extra={viewBlockSetting(blockIndex)}>
            <StudioForm settingMode={settingMode} items={block.propItems} ref={block.formInstanceRef} />
          </Collapse.Panel>)
        })
      }
    </Collapse>)
  }

  const viewGroupSetting = () => {
    if (!settingMode) {
      return null;
    }

    const delGroup = (groupIndex: number) => {
      codeMetaStudioData.propGroups.splice(groupIndex, 1);
      setCodeMetaStudioData({ ...codeMetaStudioData });
    }

    const moveGroup = (originIndex: number, up: boolean) => {
      const [moveGroup] = codeMetaStudioData.propGroups.splice(originIndex, 1);
      if (up) {
        codeMetaStudioData.propGroups.splice(originIndex - 1, 0, moveGroup!);
      } else {
        codeMetaStudioData.propGroups.splice(originIndex + 1, 0, moveGroup!);
      }
      setCodeMetaStudioData({ ...codeMetaStudioData });
    }

    const viewContent = <>
      <Row gutter={[0, 10]}>
        {
          codeMetaStudioData.propGroups.map((group, index) => {
            return (<React.Fragment key={index}>
              <Col span={16}>
                <Input maxLength={10} value={group.title} onChange={(e) => {
                  group.title = e.target.value;
                  setCodeMetaStudioData({ ...codeMetaStudioData });
                }} size="small" />
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Space size="small">
                  <Typography.Link disabled={index === 0} onClick={() => moveGroup(index, true)}>
                    <VerticalAlignTopOutlined />
                  </Typography.Link>
                  <Typography.Link disabled={index === codeMetaStudioData.propGroups.length - 1} onClick={() => moveGroup(index, false)}>
                    <VerticalAlignBottomOutlined />
                  </Typography.Link>
                  <Typography.Link onClick={() => delGroup(index)} disabled={index === 0 && codeMetaStudioData.propGroups.length === 1}>
                    <DeleteOutlined />
                  </Typography.Link>
                </Space>
              </Col>
            </React.Fragment>)
          })
        }
      </Row>
      <div style={{ textAlign: 'center', marginBottom: '-5px' }}>
        <Button type="link" onClick={() => {
          codeMetaStudioData.propGroups.push({
            title: '分组' + codeMetaStudioData.propGroups.length,
            propBlocks: []
          });
          setCodeMetaStudioData({ ...codeMetaStudioData });
        }}>添加</Button>
      </div>
    </>

    return <Popover trigger="click" placement="bottomRight" overlayInnerStyle={{ width: '300px' }} content={viewContent}>
      <Button type="link" icon={<SettingOutlined />} style={{ marginRight: '5px' }}></Button>
    </Popover>
  }

  const moveTabNode = (dragKey: number, hoverKey: number) => {
    dragKey = +dragKey;
    hoverKey = +hoverKey;
    if (dragKey === hoverKey) {
      return;
    }

    const drag = codeMetaStudioData.propGroups[dragKey]!;
    codeMetaStudioData.propGroups.splice(hoverKey, 0, drag);
    if (hoverKey < dragKey) {
      codeMetaStudioData.propGroups.splice(dragKey + 1, 1);
    } else {
      codeMetaStudioData.propGroups.splice(dragKey, 1);
    }
    setCodeMetaStudioData({ ...codeMetaStudioData });
  }

  const renderTabBar = (props: any, DefaultTabBar: React.ElementType) => (
    <DefaultTabBar {...props}>
      {(node: React.ReactElement) => (
        <DraggableTabNode key={node.key} index={node.key as number} moveNode={moveTabNode}>
          {node as any}
        </DraggableTabNode>
      )}
    </DefaultTabBar>
  );

  /////////////////////////////////////////////////////////////////////////////
  return <>
    <Button type="primary" onClick={() => getData()}>保存</Button>
    <DndProvider backend={HTML5Backend}>
      <Tabs type="card" size="small" className="studio-tabs" renderTabBar={renderTabBar} tabBarExtraContent={viewGroupSetting()}>
        {
          codeMetaStudioData.propGroups.map((group, groupIndex) => {
            return (<Tabs.TabPane tab={group.title} key={groupIndex}>
              <div style={{ textAlign: 'center' }} hidden={!settingMode}>
                <Button type="link" icon={<FolderAddOutlined />} onClick={() => {
                  group.propBlocks.push({
                    title: '区块' + group.propBlocks.length,
                    propItems: [],
                    formInstanceRef: { current: null }
                  });
                  setCodeMetaStudioData({ ...codeMetaStudioData });
                }}>添加</Button>
              </div>

              {viewBlocks(group)}
            </Tabs.TabPane>)
          })
        }
      </Tabs>
    </DndProvider>
  </>
}

const initData = {
  name: '测试',
  propGroups: [{
    title: '测试',
    propBlocks: [
      {
        title: '测试',
        formInstanceRef: { current: null },
        propItems: [{
          key: 'demo',
          label: 'label',
          name: 'xxx',
          type: 'input'
        }]
      }, {
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