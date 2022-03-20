import { useState } from "react"

export const useRefresh = () => {
  const [, setTick] = useState(0);
  return () => {
    setTick((tick) => ++tick);
  }
}