import { GrootStateType, viewRender } from "@grootio/common";
import { groot } from "index";

const Banner = () => {
  const { useStateByName } = groot.stateManager<GrootStateType>();

  return <>banner</>
}

export default Banner;