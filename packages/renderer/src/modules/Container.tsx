import { ReactDOM } from "react";
import { ComponentSlot } from "./ComponentSlot";

const Container: React.FC<{ children: ReactDOM }> = ({ children }) => {
  return <div >
    <ComponentSlot children={children} />
  </div>
}

export default Container;