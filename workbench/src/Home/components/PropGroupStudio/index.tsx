import { useModel } from "@util/robot";
import StudioModel from '@model/StudioModel';
import { Button, Collapse, Space, Typography } from "antd";
import { CaretRightOutlined, DeleteOutlined, EditOutlined, PlusOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";
import PropBlockStudio from "../PropBlockStudio";
import WorkbenchModel from "@model/WorkbenchModel";

import styles from './index.module.less';
import { useState } from "react";

type PropsType = {
  group: PropGroup,
  templateBlock?: PropBlock
}

const PropGroupStudio: React.FC<PropsType> = ({ group, templateBlock }) => {
  const [studioModel, updateAction] = useModel<StudioModel>('studio');
  const [workbenchModel] = useModel<WorkbenchModel>('workbench');
  const [, refresh] = useState(0);

  const editBlock = (block: PropBlock) => {
    updateAction(() => {
      studioModel.currSettingPropBlock = JSON.parse(JSON.stringify(block));
    })
  }

  const onChangeCollapse = (key: string | string[]) => {
    if (Array.isArray(key)) {
      group.expandBlockIdList = key.map(k => +k);
    } else {
      group.expandBlockIdList = [+key];
    }
    refresh(c => ++c);
  }

  const renderBlockSetting = (block: PropBlock, blockIndex: number) => {
    if (!workbenchModel.designMode || templateBlock) return null;

    return (<Space size="small" >
      <Typography.Link onClick={(e) => {
        e.stopPropagation();
        studioModel.showPropItemSettinngForCreate(block);
      }}>
        <PlusOutlined />
      </Typography.Link>

      {
        blockIndex > 0 && (
          <Typography.Link onClick={(e) => {
            e.stopPropagation();
            studioModel.movePropBlock(group, blockIndex, true);
          }}>
            <VerticalAlignTopOutlined />
          </Typography.Link>
        )
      }

      {
        blockIndex < group.propBlockList.length - 1 && (
          <Typography.Link onClick={(e) => {
            e.stopPropagation();
            studioModel.movePropBlock(group, blockIndex, false);
          }}>
            <VerticalAlignBottomOutlined />
          </Typography.Link>
        )
      }

      <Typography.Link onClick={(e) => {
        e.stopPropagation();
        editBlock(block);
      }}>
        <EditOutlined />
      </Typography.Link>

      {
        group.propBlockList.length > 1 && (
          <Typography.Link onClick={(e) => {
            e.stopPropagation();
            studioModel.delBlock(block.id, group);
          }} >
            <DeleteOutlined />
          </Typography.Link>
        )
      }
    </Space>)
  }

  return (<>
    <Collapse activeKey={group.expandBlockIdList} onChange={onChangeCollapse} bordered={false}
      expandIconPosition="end" expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
      {
        group.propBlockList.map((block, blockIndex) => {
          return (<Collapse.Panel key={block.id} className={styles.blockContainer} extra={renderBlockSetting(block, blockIndex)}
            header={<>
              {block.name}<i className="highlight" hidden={!block.highlight} />
            </>} >
            <PropBlockStudio block={block} freezeSetting={!!templateBlock} />
          </Collapse.Panel>)
        })
      }
    </Collapse>
    <div className={styles.footerAction}>
      {
        workbenchModel.designMode && !templateBlock && (
          <Button type="primary" ghost block onClick={() => {
            studioModel.showPropBlockSettinngForCreate(group);
          }}>
            添加配置块
          </Button>
        )
      }

      {
        templateBlock && (
          <Button disabled={!templateBlock?.propItemList.length} type="primary" ghost block onClick={() => {
            studioModel.addBlockFromTemplate(group.id)
          }}>
            复制配置块
          </Button>
        )
      }
    </div>

  </>)
};

export default PropGroupStudio;