import { useModel } from "@util/robot";
import StudioModel from '@model/Studio';
import { Button, Collapse, Space, Typography } from "antd";
import { CaretRightOutlined, DeleteOutlined, FolderAddOutlined, PlusOutlined, SettingOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";
import StudioBlock from "../StudioBlock";

const StudioGroup: React.FC<{ group: CodeMetaStudioPropGroup }> = ({ group }) => {
  const [model, updateAction] = useModel<StudioModel>('studio');

  const delBlock = (blockIndex: number) => {
    updateAction(() => group.propBlocks.splice(blockIndex, 1));
  }

  const editBlock = (block: CodeMetaStudioPropBlock) => {
    updateAction(() => {
      model.currSettingStudioBlock = JSON.parse(JSON.stringify(block));
      model.currGroupOfSettingStudioBlock = group;
    })
  }

  // 添加配置项
  const addStudioItem = (block: CodeMetaStudioPropBlock) => {
    updateAction(() => {
      model.currSettingStudioItem = {
        type: 'input',
        label: '属性' + block.propItems.length,
        propKey: 'prop' + block.propItems.length,
      }
      model.currBlockOfSettingStudioItem = block;
    })
  }

  const renderBlockSetting = (block: CodeMetaStudioPropBlock, blockIndex: number) => {
    if (!model.settingMode) return null;

    return (<Space size="small">
      <Typography.Link onClick={(e) => {
        e.stopPropagation();
        addStudioItem(block);
      }}>
        <PlusOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === 0} onClick={(e) => {
        e.stopPropagation();
        model.moveStudioBlock(group, blockIndex, true);
      }}>
        <VerticalAlignTopOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === group.propBlocks.length - 1} onClick={(e) => {
        e.stopPropagation();
        model.moveStudioBlock(group, blockIndex, false);
      }}>
        <VerticalAlignBottomOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === 0 && group.propBlocks.length === 1} onClick={(e) => {
        e.stopPropagation();
        delBlock(blockIndex);
      }} >
        <DeleteOutlined />
      </Typography.Link>
      <Typography.Link onClick={(e) => {
        e.stopPropagation();
        editBlock(block);
      }}>
        <SettingOutlined />
      </Typography.Link>
    </Space>)
  }


  return (<>
    <Collapse defaultActiveKey={group.propBlocks.map(b => b.id!)} bordered={false} expandIconPosition="right" expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
      {
        group.propBlocks.map((block, blockIndex) => {
          return (<Collapse.Panel header={block.title} key={block.id!} extra={renderBlockSetting(block, blockIndex)}>
            <StudioBlock group={group} block={block} />
          </Collapse.Panel>)
        })
      }
    </Collapse>

    <div style={{ textAlign: 'center' }} hidden={!model.settingMode}>
      <Button type="link" icon={<FolderAddOutlined />} onClick={() => {
        updateAction(() => {
          model.currSettingStudioBlock = {
            title: '区块' + group.propBlocks.length,
            propItems: [],
          };
          model.currGroupOfSettingStudioBlock = group;
        })
      }}>添加配置块</Button>
    </div>
  </>)
};

export default StudioGroup;