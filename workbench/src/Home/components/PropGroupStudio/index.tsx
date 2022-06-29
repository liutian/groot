import { useModel } from "@util/robot";
import StudioModel from '@model/StudioModel';
import { Button, Collapse, Space, Typography } from "antd";
import { CaretRightOutlined, DeleteOutlined, PlusOutlined, SettingOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";
import PropBlockStudio from "../PropBlockStudio";
import WorkbenchModel from "@model/WorkbenchModel";

type PropsType = {
  group: PropGroup,
  templateBlock?: PropBlock
}

const PropGroupStudio: React.FC<PropsType> = ({ group, templateBlock }) => {
  const [studioModel, updateAction] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');

  const editBlock = (block: PropBlock) => {
    updateAction(() => {
      studioModel.currSettingPropBlock = JSON.parse(JSON.stringify(block));
    })
  }

  const renderBlockSetting = (block: PropBlock, blockIndex: number) => {
    if (!workbenchModel.stageMode || templateBlock) return null;

    return (<Space size="small">
      <Typography.Link onClick={(e) => {
        e.stopPropagation();
        studioModel.showPropItemSettinngForCreate(block);
      }}>
        <PlusOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === 0} onClick={(e) => {
        e.stopPropagation();
        studioModel.movePropBlock(group, blockIndex, true);
      }}>
        <VerticalAlignTopOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === group.propBlockList.length - 1} onClick={(e) => {
        e.stopPropagation();
        studioModel.movePropBlock(group, blockIndex, false);
      }}>
        <VerticalAlignBottomOutlined />
      </Typography.Link>
      <Typography.Link disabled={blockIndex === 0 && group.propBlockList.length === 1} onClick={(e) => {
        e.stopPropagation();
        studioModel.delBlock(block.id, group);
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
    <Collapse defaultActiveKey={group.propBlockList.map(b => b.id)} bordered={false}
      expandIconPosition="end" expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
      {
        group.propBlockList.map((block, blockIndex) => {
          return (<Collapse.Panel key={block.id} extra={renderBlockSetting(block, blockIndex)}
            header={<>
              {block.name}<i className="highlight" hidden={!block.highlight} />
            </>} >
            <PropBlockStudio block={block} freezeSetting={!!templateBlock} />
          </Collapse.Panel>)
        })
      }
    </Collapse>
    {
      workbenchModel.stageMode && !templateBlock ? (
        <div style={{ padding: 'var(--studio-padding-x)' }}>
          <Button type="primary" ghost block onClick={() => {
            studioModel.showPropBlockSettinngForCreate(group);
          }}>
            添加配置块
          </Button>
        </div>
      ) : null
    }

    {
      templateBlock ? (
        <div style={{ padding: '16px 0 0' }}>
          {/* 内嵌模式  */}
          <Button disabled={!templateBlock?.propItemList.length} type="primary" ghost block onClick={() => {
            studioModel.addBlockFromTemplate(group.id)
          }}>
            复制模版
          </Button>
        </div>
      ) : null
    }
  </>)
};

export default PropGroupStudio;