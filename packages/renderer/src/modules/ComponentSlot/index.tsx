import { PostMessageType, RuntimeComponentValueType } from "@grootio/common";
import { useEffect, useRef } from "react";
import { controlMode } from "../../util";

type PropType = {
  children: React.ReactDOM & { _groot?: RuntimeComponentValueType },
}

type FnType = {
  respondDragOver: typeof respondDragOver,
  respondDragEnter: typeof respondDragEnter,
  respondDragLeave: typeof respondDragLeave,
  respondDragDrop: typeof respondDragDrop
}

export const ComponentSlot: React.FC<PropType> & FnType = ({ children }) => {

  if (!children) {
    console.warn('插槽未再组件原型中进行配置！');
    return null;
  } else if (!children._groot) {
    return <div>参数异常！</div>
  }

  return <>
    <div style={{ display: 'grid' }}>
      <>{children}</>
    </div>

    {controlMode && <DragZone propKeyChain={children?._groot.keyChain} />}
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
  backgroundColor: 'rgb(255 216 216)'
}

let activeSlotEle;
let draging;

const DragZone: React.FC<{ propKeyChain: string }> = ({ propKeyChain }) => {
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    (containerRef.current as any).dragEnter = () => {
      Object.assign(containerRef.current.style, highlightStyles);
    }

    (containerRef.current as any).dragLeave = () => {
      Object.assign(containerRef.current.style, styles);
    }
  }, []);

  return <div ref={containerRef} data-groot-prop-key-chain={propKeyChain} style={styles} >
    拖拽组件到这里
  </div>
}


function respondDragOver(positionX: number, positionY: number) {
  const hitEles = detectSlotEle(positionX, positionY);

  if (hitEles) {
    const [slotEle] = hitEles;

    if (slotEle !== activeSlotEle) {
      activeSlotEle?.dragLeave();
      slotEle.dragEnter();
      activeSlotEle = slotEle;
    }
  } else {
    activeSlotEle?.dragLeave();
    activeSlotEle = null;
  }
}


function respondDragEnter() {
  draging = true;
}

function respondDragLeave() {
  activeSlotEle?.dragLeave();
  activeSlotEle = null;
  draging = false;
}

function respondDragDrop(positionX: number, positionY: number, componentId: number) {
  const hitEles = detectSlotEle(positionX, positionY);
  if (hitEles) {
    const [dragSlot, componentEle] = hitEles;
    window.parent.postMessage({
      type: PostMessageType.Drag_Hit_Slot,
      data: {
        propKeyChain: dragSlot.dataset.grootPropKeyChain,
        placeComponentInstanceId: componentEle.dataset.grootComponentInstanceId,
        componentId
      }
    }, '*');

    ComponentSlot.respondDragLeave();
  }
}

function detectSlotEle(positionX: number, positionY: number) {
  if (!draging) {
    return null;
  }

  let hitEle = document.elementFromPoint(positionX, positionY) as HTMLElement;
  if (!hitEle || hitEle === document.documentElement || hitEle === document.body) {
    return null;
  }

  let hoverSlotEle, componentEle;
  do {
    if (hitEle.dataset.grootPropKeyChain) {
      hoverSlotEle = hitEle;
      componentEle = hitEle.parentElement;
      break;
    }

    hitEle = hitEle.parentElement;
  } while (hitEle);

  if (!componentEle) {
    return null;
  }

  do {
    if (componentEle.dataset.grootComponentInstanceId) {
      componentEle = componentEle;
      break;
    }

    componentEle = componentEle.parentElement;
  } while (componentEle);

  if (hoverSlotEle && componentEle) {
    return [hoverSlotEle, componentEle];
  }

  return null;
}