import PropHandleModel from "@model/PropHandleModel";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { Space, Typography } from "antd";
import { useState } from "react";

import styles from './index.module.less';

type PropsType = {
  block: PropBlock
}

const PropBlockListStructPane: React.FC<PropsType> = ({ block: propBlock }) => {
  const [propHandleModel] = useModel<PropHandleModel>(PropHandleModel.modelName);
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);

  const [childBlock] = useState<PropBlock[]>(() => {
    return propBlock.propItemList[0].childGroup.propBlockList;
  });

  if (!Array.isArray(propBlock.listStructData)) {
    propBlock.listStructData = JSON.parse(propBlock.listStructData || '[]');
  }

  const showListPerfs = () => {
    const propItem = propBlock.propItemList[0];
    propHandleModel.pushPropItemStack(propItem);
    propItem.extraUIData = {
      type: 'BlockListPrefs',
      data: propBlock
    }
  }

  const showChildGroup = () => {
    const propItem = propBlock.propItemList[0];
    propHandleModel.pushPropItemStack(propItem);
  }
  return <div className={styles.container}>
    <div>
      {childBlock?.length}
    </div>
    <div>
      <Space>
        <Typography.Link>添加子项</Typography.Link>
        <Typography.Link hidden={!workbenchModel.prototypeMode}
          onClick={() => showListPerfs()}>
          首要显示项
        </Typography.Link>
        <Typography.Link hidden={!workbenchModel.prototypeMode}
          onClick={() => showChildGroup()}>
          子项模版配置
        </Typography.Link>
      </Space>
    </div>
  </div>
}


export default PropBlockListStructPane;