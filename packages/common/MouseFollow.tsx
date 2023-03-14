import React, { HTMLAttributes, useEffect, useRef } from 'react';


/**
 * 监控鼠标拖拽时的坐标位置
 */
export const MouseFollow: React.FC<PropsType> = ({ start, end, move, cursor = 'move', ...props }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const orignPositionRef = useRef<{ x: number, y: number }>({ x: -1, y: -1 });

  useEffect(() => {
    let originBodyCursor = '';
    let originData: any;
    hostRef.current!.style.cursor = cursor;
    hostRef.current?.addEventListener('mousedown', mousedownListener);

    function mousedownListener(e: MouseEvent) {
      const cancelOrData = !!start && start();

      if (cancelOrData === false) {
        return;
      }
      originData = cancelOrData;

      originBodyCursor = document.body.style.cursor;
      document.body.style.cursor = cursor;
      orignPositionRef.current.x = e.screenX;
      orignPositionRef.current.y = e.screenY;

      document.body.addEventListener('mousemove', mousemoveListener);
      document.body.addEventListener('mouseup', () => {
        document.body.style.cursor = originBodyCursor;
        document.body.removeEventListener('mousemove', mousemoveListener);
        end && end();
      });

    }

    function mousemoveListener(e: MouseEvent) {
      if (move) {
        const x = e.screenX - orignPositionRef.current.x;
        const y = e.screenY - orignPositionRef.current.y;
        move(x, y, originData);
      }
    }
  }, []);

  return <div ref={hostRef} {...props} style={{ display: 'inline-block' }}></div>
}

type PropsType = {
  start?: () => boolean | any,
  end?: () => void,
  move?: (x: number, y: number, originData: any) => void,
  cursor?: 'move' | 'row-resize' | 'col-resize'
} & HTMLAttributes<HTMLDivElement>;
