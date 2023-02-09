import { GrootStateDict } from "@grootio/common";
import { getContext } from "context";

const Banner = () => {
  const { groot } = getContext();
  const { useStateByName } = groot.stateManager<GrootStateDict>();

  return <>banner</>
}

export default Banner;