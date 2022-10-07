import { DragAddComponentEventDataType, PostMessageType, RuntimeComponentValueType } from "@grootio/common";
import { useEffect, useRef } from "react";
import { controlMode } from "../../util";

type PropType = {
  children: React.ReactNode[] & { _groot?: RuntimeComponentValueType<null> },
}

type FnType = {
  respondDragOver: typeof respondDragOver,
  respondDragEnter: typeof respondDragEnter,
  respondDragLeave: typeof respondDragLeave,
  respondDragDrop: typeof respondDragDrop
}

export const ComponentSlot: React.FC<PropType> & FnType = ({ children }) => {

  if (!children) {
    console.warn('插槽未在组件原型中进行配置！');
    return null;
  } else if (!children._groot) {
    return <div>参数异常！</div>
  }

  return <div data-groot-prop-key-chain={children._groot.propKeyChain}
    data-groot-prop-item-id={children._groot.propItemId}
    data-groot-abstract-value-id-chain={children._groot.abstractValueIdChain}>
    {/* 预留自由布局 */}
    <div style={{ display: 'grid' }}>
      {
        children.map(child => {
          return <div data-groot-slot-item="true" key={(child as any).key}>
            {child}
          </div>
        })
      }
    </div>

    {controlMode && <DragZone />}
  </div>


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

let activeSlotEle: HTMLElement & {
  dragEnter?: () => void,
  dragLeave?: () => void,
};
let draging;

const DragZone: React.FC<{}> = () => {
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    (containerRef.current as any).dragEnter = () => {
      Object.assign(containerRef.current.style, highlightStyles);
    }

    (containerRef.current as any).dragLeave = () => {
      Object.assign(containerRef.current.style, styles);
    }
  }, []);

  return <div ref={containerRef} data-groot-slot-drag-zone="true" style={styles} >
    拖拽组件到这里
  </div>
}


function respondDragOver(positionX: number, positionY: number) {
  const hitResult = detectSlotEle(positionX, positionY);

  if (hitResult) {
    const { hitEle } = hitResult;

    if (hitEle !== activeSlotEle) {
      activeSlotEle?.dragLeave();
      activeSlotEle = hitEle;
      activeSlotEle?.dragEnter();
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
  const hitResult = detectSlotEle(positionX, positionY);
  if (!hitResult) {
    return;
  }

  const { instanceEle, slotEle, type } = hitResult;
  if (type === 'dragZone') {
    window.parent.postMessage({
      type: PostMessageType.Drag_Hit_Slot,
      data: {
        propKeyChain: slotEle.dataset.grootPropKeyChain,
        placeComponentInstanceId: +instanceEle.dataset.grootComponentInstanceId,
        componentId,
        propItemId: +slotEle.dataset.grootPropItemId,
        abstractValueIdChain: slotEle.dataset.grootAbstractValueIdChain
      } as DragAddComponentEventDataType
    }, '*');
  }

  ComponentSlot.respondDragLeave();
}

type detectResultType = {
  type: 'dragZone' | 'item',
  hitEle: HTMLElement,
  instanceEle: HTMLElement,
  slotEle: HTMLElement
}

function detectSlotEle(positionX: number, positionY: number): detectResultType {
  if (!draging) {
    return null;
  }

  let hitEle = document.elementFromPoint(positionX, positionY) as HTMLElement;
  if (!hitEle || hitEle === document.documentElement || hitEle === document.body) {
    return null;
  }

  let dragZoneEle: HTMLElement, itemEle: HTMLElement, slotEle: HTMLElement;
  do {
    if (hitEle.dataset.grootSlotDragZone) {
      dragZoneEle = hitEle;
      slotEle = hitEle.parentElement;
      break;
    } else if (hitEle.dataset.grootSlotItem) {// todo ...
      itemEle = hitEle;
      slotEle = hitEle.parentElement.parentElement;
    }

    hitEle = hitEle.parentElement;
  } while (hitEle);

  if (!slotEle) {
    return null;
  }

  let instanceEle = slotEle.parentElement;
  do {
    if (instanceEle.dataset.grootComponentInstanceId) {
      break;
    }

    instanceEle = instanceEle.parentElement;
  } while (instanceEle);

  if (!instanceEle) {
    console.warn('ComponentSlot组件未包含在规定组件中')
    return null;
  }

  return {
    type: dragZoneEle ? 'dragZone' : 'item',
    hitEle: dragZoneEle || itemEle,
    instanceEle,
    slotEle
  }
}