import { grootStateManager } from "context";

const Banner = () => {
  const { useStateByName } = grootStateManager();

  return <>banner</>
}

export default Banner;