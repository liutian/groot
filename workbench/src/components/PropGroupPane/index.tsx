import { useModel } from "@util/robot";
import { Button, Collapse, Space, Typography } from "antd";
import { CaretRightOutlined, DeleteOutlined, EditOutlined, PlusOutlined, VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";
import PropBlockPane from "../PropBlockPane";
import WorkbenchModel from "@model/WorkbenchModel";

import styles from './index.module.less';
import { useState } from "react";
import PropPersistModel from "@model/PropPersistModel";
import { PropBlockStructType } from "@grootio/common";
import PropBlockListStructPane from "@components/PropBlockListStructPane";
import { stringify } from "@util/utils";

type PropsType = {
  group: PropGroup,
}

const PropGroupPane: React.FC<PropsType> = ({ group }) => {
  const [propPersistModel, propPersistAction] = useModel<PropPersistModel>(PropPersistModel.modelName);
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
  const [, refresh] = useState(0);
  const noSetting = !workbenchModel.prototypeMode || group.parentItem?.noSetting;

  const editBlock = (block: PropBlock) => {
    propPersistAction(() => {
      propPersistModel.currSettingPropBlock = JSON.parse(stringify(block));
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
    if (noSetting) return null;

    return (<Space size="small" >
      {
        block.struct !== PropBlockStructType.List && (
          <Typography.Link onClick={(e) => {
            e.stopPropagation();
            propPersistModel.showPropItemSettinngForCreate(block);
          }}>
            <PlusOutlined />
          </Typography.Link>
        )
      }

      <Typography.Link onClick={(e) => {
        e.stopPropagation();
        editBlock(block);
      }}>
        <EditOutlined />
      </Typography.Link>

      <Typography.Link onClick={(e) => {
        e.stopPropagation();
        propPersistModel.delBlock(block.id, group);
      }} >
        <DeleteOutlined />
      </Typography.Link>

      {
        blockIndex > 0 && (
          <Typography.Link onClick={(e) => {
            e.stopPropagation();
            propPersistModel.movePropBlock(group, blockIndex, true);
          }}>
            <VerticalAlignTopOutlined />
          </Typography.Link>
        )
      }

      {
        blockIndex < group.propBlockList.length - 1 && (
          <Typography.Link onClick={(e) => {
            e.stopPropagation();
            propPersistModel.movePropBlock(group, blockIndex, false);
          }}>
            <VerticalAlignBottomOutlined />
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
            {
              block.struct === PropBlockStructType.Default ?
                (<PropBlockPane block={block} />)
                :
                (<PropBlockListStructPane block={block} />)
            }

          </Collapse.Panel>)
        })
      }
    </Collapse>
    <div className={styles.footerAction}>
      {
        !noSetting && (
          <Button type="primary" ghost block onClick={() => {
            propPersistModel.showPropBlockSettinngForCreate(group);
          }}>
            添加配置块
          </Button>
        )
      }
    </div>

  </>)
};

export default PropGroupPane;