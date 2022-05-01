import { useModel } from "@util/robot";
import StudioModel from '@model/Studio';
import { Collapse, Space, Typography } from "antd";
import { CaretRightOutlined, DeleteOutlined, PlusOutlined, SettingOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";
import StudioBlock from "../StudioBlock";

type PropsType = {
  group: CodeMetaStudioGroup,
  inner?: boolean,
  innerTemplateBlock?: CodeMetaStudioBlock
}

const StudioGroup: React.FC<PropsType> = ({ group, inner = false, innerTemplateBlock }) => {
  const [model, updateAction] = useModel<StudioModel>('studio');

  const delBlock = (blockIndex: number) => {
    updateAction(() => group.propBlocks.splice(blockIndex, 1));
  }

  const editBlock = (block: CodeMetaStudioBlock) => {
    updateAction(() => {
      model.currSettingStudioBlock = JSON.parse(JSON.stringify(block));
    })
  }

  const renderBlockSetting = (block: CodeMetaStudioBlock, blockIndex: number) => {
    if (!model.settingMode) return null;

    return (<Space size="small">
      <Typography.Link onClick={(e) => {
        e.stopPropagation();
        model.showStudioBlockSettinngForCreate(block, group, inner, innerTemplateBlock!);
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
    <Collapse defaultActiveKey={group.propBlocks.map(b => b.id)} bordered={false} expandIconPosition="right" expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
      {
        group.propBlocks.map((block, blockIndex) => {
          return (<Collapse.Panel header={block.name} key={block.id} extra={renderBlockSetting(block, blockIndex)}>
            <StudioBlock block={block} noSetting={inner} />
          </Collapse.Panel>)
        })
      }
    </Collapse>
  </>)
};

export default StudioGroup;