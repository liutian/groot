import React, { useEffect, useRef } from 'react';

type PropsType = {
  start?: () => boolean,
  end?: () => void,
  move?: (x: number, y: number) => void,
  cursor?: 'move' | 'row-resize' | 'col-resize'
}

const MouseFollow: React.FC<PropsType> = ({ start, end, move, cursor = 'move' }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const orignPositionRef = useRef<{ x: number, y: number }>({ x: -1, y: -1 });

  useEffect(() => {
    let originBodyCursor = '';
    hostRef.current!.style.cursor = cursor;
    hostRef.current?.addEventListener('mousedown', mousedownListener);

    function mousedownListener(e: MouseEvent) {
      const cancel = !!start && start();

      if (cancel) {
        return;
      }

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
        move(x, y);
      }
    }
  }, []);

  return <div ref={hostRef}></div>
}

export default MouseFollow;