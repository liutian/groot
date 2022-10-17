import { ReactNode } from "react";
import { ComponentSlot } from "./ComponentSlot";

const Container: React.FC<{ children: ReactNode[] }> = ({ children }) => {
  return <div >
    <ComponentSlot children={children} />
  </div>
}

export default Container;