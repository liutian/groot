import { GrootStateDict } from "@grootio/common";
import { getContext } from "context";

const StatusBar = () => {
  const { groot } = getContext();
  const { useStateByName } = groot.stateManager<GrootStateDict>();

  return <>StatusBar</>
}

export default StatusBar;