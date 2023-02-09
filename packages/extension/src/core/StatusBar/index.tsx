import { grootStateManager } from "context";

const StatusBar = () => {
  const { useStateByName } = grootStateManager();

  return <>StatusBar</>
}

export default StatusBar;