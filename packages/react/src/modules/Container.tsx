import { ReactElement } from "react";
import { ComponentSlot } from "./ComponentSlot";

const Container: React.FC<{ children: ReactElement[] }> = ({ children }) => {
  return <div >
    <ComponentSlot children={children} />
  </div>
}

export default Container;