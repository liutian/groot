import { useRegisterModel } from '@grootio/common';
import { useEffect, useRef } from "react"

import styles from './index.module.less'
import { grootHookManager } from "context"
import WorkAreaModel from './WorkAreaModel';
import Viewport from './Viewport';

export const WorkArea = () => {
  const maskEleRef = useRef<HTMLDivElement>();
  useRegisterModel(WorkAreaModel)
  const { registerHook } = grootHookManager()

  useEffect(() => {
    registerHook('gh.sidebar.drag.start', () => {
      maskEleRef.current.classList.add('show')
    })

    registerHook('gh.sidebar.drag.end', () => {
      maskEleRef.current.classList.remove('show')
    })
  }, []);

  return <div className={styles.container}>
    <Viewport />
    {/* 防止拖拽缩放过程中由于鼠标移入iframe中丢失鼠标移动事件 */}
    <div className={styles.mask} ref={maskEleRef} ></div>
  </div>
}