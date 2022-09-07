import { PostMessageType } from "@grootio/common";
import { useEffect, useRef } from "react";
import { controlMode } from "../../util";

type PropType = {
  name: string
}

export const DragSlot = (props: PropType) => {

  if (!controlMode) {
    return null;
  }

  return <DragZone {...props} />;
}


const styles = {
  backgroundColor: 'rgb(216 244 255)',
  flexGrow: 1,
  flexBasis: '100px'
}
const highlightStyles = {
  backgroundColor: 'red'
}

let activeDragSlot;
let draging;

const DragZone: React.FC<PropType> = ({ name }) => {
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    (containerRef.current as any).dragEnter = () => {
      Object.assign(containerRef.current.style, highlightStyles);
    }

    (containerRef.current as any).dragLeave = () => {
      Object.assign(containerRef.current.style, styles);
    }
  }, []);

  return <div ref={containerRef} data-groot-drag-slot-name={name} style={styles} />
}


DragSlot.respondDragOver = (positionX: number, positionY: number) => {
  const hitEles = detectDragSlotAndComponent(positionX, positionY);

  if (hitEles) {
    console.log('hit elements ');
    const [dragSlot] = hitEles;

    if (dragSlot !== activeDragSlot) {
      activeDragSlot?.dragLeave();
      dragSlot.dragEnter();
      activeDragSlot = dragSlot;
    }
  } else {
    activeDragSlot?.dragLeave();
    activeDragSlot = null;
  }
}


DragSlot.respondDragEnter = () => {
  draging = true;
}

DragSlot.respondDragLeave = () => {
  activeDragSlot?.dragLeave();
  activeDragSlot = null;
  draging = false;
}

DragSlot.respondDragDrop = (positionX: number, positionY: number, component: any) => {
  const hitEles = detectDragSlotAndComponent(positionX, positionY);
  if (hitEles) {
    console.log('hit elements ');
    const [dragSlot, componentEle] = hitEles;
    window.parent.postMessage({
      type: PostMessageType.Drag_Hit_Slot,
      data: {
        slot: dragSlot.dataset.grootDragSlotName,
        componentEle: componentEle.dataset.grootComponentId,
        component
      }
    }, '*');

    DragSlot.respondDragLeave();
  }
}

function detectDragSlotAndComponent(positionX: number, positionY: number) {
  if (!draging) {
    return null;
  }

  let hitEle = document.elementFromPoint(positionX, positionY) as HTMLElement;
  if (!hitEle || hitEle === document.documentElement || hitEle === document.body) {
    return null;
  }

  let dragSlot, componentEle;
  do {
    if (hitEle.dataset.grootDragSlotName) {
      dragSlot = hitEle;
      hitEle = hitEle.parentElement;
      break;
    }

    hitEle = hitEle.parentElement;
  } while (hitEle);

  if (!hitEle) {
    return null;
  }

  do {
    if (hitEle.dataset.grootComponentId) {
      componentEle = hitEle;
      break;
    }

    hitEle = hitEle.parentElement;
  } while (hitEle);

  if (dragSlot && componentEle) {
    return [dragSlot, componentEle];
  }

  return null;
}