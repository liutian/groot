import { DropboxOutlined } from "@ant-design/icons";
import WorkbenchModel from "@model/WorkbenchModel";
import { useModel } from "@util/robot";
import { useState } from "react";

import styles from './index.module.less';

export const DragComponent: React.FC<{ component: Component }> = ({ component }) => {
  const [workbenchModel] = useModel<WorkbenchModel>(WorkbenchModel.modelName);
  const [iframeDragMaskEle] = useState<HTMLElement>(() => {
    return document.getElementById(workbenchModel.iframeDragMaskId);
  });

  const dragstart = (e) => {
    iframeDragMaskEle.classList.add('show');
    e.dataTransfer.setData('groot', JSON.stringify(component));
    console.log('drag start');
  }

  const dragend = () => {
    iframeDragMaskEle.classList.remove('show');
    console.log('drag end');
  }

  return <>
    <div draggable="true" className={styles.container} onDragStart={dragstart} onDragEnd={dragend}>
      <DropboxOutlined style={{ fontSize: '30px' }} />
      <h4>
        {component.name}
      </h4>
    </div>
  </>
}