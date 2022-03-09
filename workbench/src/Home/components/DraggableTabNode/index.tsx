import { ReactChildren, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import './index.less'

const type = 'DraggableTabNode';

type PramsType = {
  index: number,
  children: ReactChildren,
  moveNode: (dragKey: number, hoverKey: number) => void
}

const DraggableTabNode: React.FC<PramsType> = ({ index, children, moveNode }) => {
  const ref = useRef({} as any);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { index: dragIndex }: any = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: 'tab-dropping',
      };
    },
    drop: (item: any) => {
      moveNode(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: { index },
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