import { useModel } from "@util/robot";
import StudioModel from '@model/StudioModel';
import { Button, Collapse, Space, Typography } from "antd";
import { CaretRightOutlined, DeleteOutlined, PlusOutlined, SettingOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";
import PropBlockStudio from "../PropBlockStudio";

type PropsType = {
  group: PropGroup,
  templateBlock?: PropBlock
}

const PropGroupStudio: React.FC<PropsType> = ({ group, templateBlock }) => {
  const [model, updateAction] = useModel<StudioModel>('studio');

  const editBlock = (block: PropBlock) => {
    updateAction(() => {
      model.currSettingPropBlock = JSON.parse(JSON.stringify(block));
    })
  }

  const renderBlockSetting = (block: PropBlock, blockIndex: number) => {
    if (!model.editMode) return null;

    return (<Space size="small">
      <Typography.Link onClick={(e) => {
        e.stopPropagation();
        model.showPropItemSettinngForCreate(block);
      }}>
        <PlusOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === 0} onClick={(e) => {
        e.stopPropagation();
        model.movePropBlock(group, blockIndex, true);
      }}>
        <VerticalAlignTopOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === group.propBlockList.length - 1} onClick={(e) => {
        e.stopPropagation();
        model.movePropBlock(group, blockIndex, false);
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
        !!templateBlock ? null : (
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
            <PropBlockStudio block={block} freezeSetting={!!templateBlock} />
          </Collapse.Panel>)
        })
      }
    </Collapse>
    {
      model.editMode && group.root ? (
        <div style={{ padding: '16px' }}>
          <Button type="primary" ghost block onClick={() => {
            model.showPropBlockSettinngForCreate(group);
          }}>
            添加配置块
          </Button>
        </div>
      ) : null
    }

    {
      !group.root ? (
        <div style={{ padding: '16px 0 0' }}>
          {/* 内嵌模式  */}
          <Button disabled={!templateBlock?.propItemList.length} type="primary" ghost block onClick={() => {
            model.addBlockFromTemplate(group.id)
          }}>
            复制模版
          </Button>
        </div>
      ) : null
    }
  </>)
};

export default PropGroupStudio;