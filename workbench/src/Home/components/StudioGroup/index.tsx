import { useModel } from "@util/robot";
import StudioModel from '@model/Studio';
import { Button, Collapse, Space, Typography } from "antd";
import { CaretRightOutlined, DeleteOutlined, PlusOutlined, SettingOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";
import StudioBlock from "../StudioBlock";

type PropsType = {
  group: CodeMetaStudioGroup,
  innerTemplateBlock?: CodeMetaStudioBlock
}

const StudioGroup: React.FC<PropsType> = ({ group, innerTemplateBlock }) => {
  const [model, updateAction] = useModel<StudioModel>('studio');

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
        model.showStudioItemSettinngForCreate(block);
      }}>
        <PlusOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === 0} onClick={(e) => {
        e.stopPropagation();
        model.moveStudioBlock(group, blockIndex, true);
      }}>
        <VerticalAlignTopOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === group.propBlockList.length - 1} onClick={(e) => {
        e.stopPropagation();
        model.moveStudioBlock(group, blockIndex, false);
      }}>
        <VerticalAlignBottomOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === 0 && group.propBlockList.length === 1} onClick={(e) => {
        e.stopPropagation();
        model.delBlock(block.id, group);
      }} >
        <DeleteOutlined />
      </Typography.Link>
      {
        !!innerTemplateBlock ? null : (
          <Typography.Link onClick={(e) => {
            e.stopPropagation();
            editBlock(block);
          }}>
            <SettingOutlined />
          </Typography.Link>
        )
      }
    </Space>)
  }


  return (<>
    <Collapse defaultActiveKey={group.propBlockList.map(b => b.id)} bordered={false}
      expandIconPosition="right" expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
      {
        group.propBlockList.map((block, blockIndex) => {
          return (<Collapse.Panel header={block.name} key={block.id} extra={renderBlockSetting(block, blockIndex)}>
            <StudioBlock block={block} dynamic={!!innerTemplateBlock} />
          </Collapse.Panel>)
        })
      }
    </Collapse>
    {
      model.settingMode ? (
        <div style={{ padding: group.isRoot ? '16px' : '16px 0 0' }}>
          <Button hidden={!group.isRoot} type="primary" ghost block onClick={() => {
            model.showStudioBlockSettinngForCreate(group);
          }}>
            添加
          </Button>

          <Button hidden={group.isRoot} disabled={!group.templateBlock?.propItemList.length} type="primary" ghost block onClick={() => {
            model.addBlockFromTemplate(group.id)
          }}>
            添加
          </Button>

        </div>
      ) : null
    }
  </>)
};

export default StudioGroup;