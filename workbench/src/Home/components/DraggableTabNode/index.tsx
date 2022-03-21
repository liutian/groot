import { ReactChildren, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import './index.less'

const type = 'DraggableTabNode';

type PramsType = {
  nodeKey: string,
  children: ReactChildren,
  moveNode: (dragKey: string, hoverKey: string) => void
}

const DraggableTabNode: React.FC<PramsType> = ({ nodeKey, children, moveNode }) => {
  const ref = useRef({} as any);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { nodeKey: dragKey }: any = monitor.getItem() || {};
      if (dragKey === nodeKey) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: 'tab-dropping',
      };
    },
    drop: (item: any) => {
      moveNode(item.nodeKey, nodeKey);
    },
  });
  const [, drag] = useDrag({
    type,
    item: { nodeKey },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));
  return (
    <div ref={ref} className={isOver ? dropClassName : ''}>
      {children}
    </div>
  );
};

export default DraggableTabNode;