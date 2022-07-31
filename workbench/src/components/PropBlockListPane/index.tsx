import PropHandleModel from "@model/PropHandleModel";
import { useModel } from "@util/robot";
import { Space, Typography } from "antd";
import { useState } from "react";

import styles from './index.module.less';

type PropsType = {
  block: PropBlock
}

const PropBlockListPane: React.FC<PropsType> = ({ block }) => {
  const [propHandleModel] = useModel<PropHandleModel>(PropHandleModel.modelName);

  const [childBlock] = useState<PropBlock[]>(() => {
    return block.propItemList[0].childGroup.propBlockList;
  });

  return <div className={styles.container}>
    <div>
      {childBlock?.length}
    </div>
    <div>
      <Space>
        <Typography.Link>添加子项</Typography.Link>
        <Typography.Link>首要显示项</Typography.Link>
        <Typography.Link onClick={() => propHandleModel.pushPropItemStack(block.propItemList[0])}>子项模版配置</Typography.Link>
      </Space>
    </div>
  </div>
}


export default PropBlockListPane;