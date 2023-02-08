import { GrootStateType, viewRender } from "@grootio/common";
import { groot } from "index";

const StatusBar = () => {
  const { useStateByName } = groot.stateManager<GrootStateType>();

  return <>StatusBar</>
}

export default StatusBar;