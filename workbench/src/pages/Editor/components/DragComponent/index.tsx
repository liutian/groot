import { DropboxOutlined } from "@ant-design/icons";

import styles from './index.module.less';

export const DragComponent: React.FC<{ component: Component }> = ({ component }) => {
  const dragstart = (e) => {
    e.dataTransfer.setData('groot', JSON.stringify(component));
    console.log('drag start');
  }

  const drag = () => {
    console.log('drag...');
  }

  const dragend = () => {
    console.log('drag end');
  }

  return <>
    <div draggable="true" className={styles.container} onDragStart={dragstart} onDrag={drag} onDragEnd={dragend}>
      <DropboxOutlined style={{ fontSize: '30px' }} />
      <h4>
        {component.name}
      </h4>
    </div>
  </>
}