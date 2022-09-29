import { PostMessageType } from "@grootio/common";
import { useEffect, useRef } from "react";
import { controlMode } from "../../util";

type PropType = {
  children: React.ReactDOM & { _groot?: { keyChain: string } },
}

type FnType = {
  respondDragOver: typeof respondDragOver,
  respondDragEnter: typeof respondDragEnter,
  respondDragLeave: typeof respondDragLeave,
  respondDragDrop: typeof respondDragDrop
}

export const ComponentSlot: React.FC<PropType> & FnType = ({ children }) => {

  if (!children) {
    return <></>
  } else if (!children._groot) {
    return <div>参数异常！</div>
  }

  return <>
    <div style={{ display: 'grid' }}>
      <>{children}</>
    </div>

    {controlMode && <DragZone name={children?._groot.keyChain} />}
  </>
}

ComponentSlot.respondDragOver = respondDragOver;
ComponentSlot.respondDragEnter = respondDragEnter;
ComponentSlot.respondDragLeave = respondDragLeave;
ComponentSlot.respondDragDrop = respondDragDrop;


const styles = {
  display: 'flex',
  backgroundColor: 'rgb(216 244 255)',
  height: '100px',
  'alignItems': 'center',
  'justifyContent': 'center'
}
const highlightStyles = {
  backgroundColor: 'red'
}

let activeDragSlot;
let draging;

const DragZone: React.FC<{ name: string }> = ({ name }) => {
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    (containerRef.current as any).dragEnter = () => {
      Object.assign(containerRef.current.style, highlightStyles);
    }

    (containerRef.current as any).dragLeave = () => {
      Object.assign(containerRef.current.style, styles);
    }
  }, []);

  return <div ref={containerRef} data-groot-drag-slot-name={name} style={styles} >
    拖拽组件到这里
  </div>
}


function respondDragOver(positionX: number, positionY: number) {
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


function respondDragEnter() {
  draging = true;
}

function respondDragLeave() {
  activeDragSlot?.dragLeave();
  activeDragSlot = null;
  draging = false;
}

function respondDragDrop(positionX: number, positionY: number, component: any) {
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

    ComponentSlot.respondDragLeave();
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