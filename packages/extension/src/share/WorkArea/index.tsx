import { grootHookManager } from "context"
import { useState } from "react"

export const WorkArea = () => {
  useState(() => {
    grootHookManager().registerHook('gh.stage.syncData', (data) => {
      console.log('syncData')
    })
  })
  return <>WorkArea</>
}