import { ReactDOM } from "react";
import { ComponentSlot } from "./ComponentSlot";

const PageContainer: React.FC<{ children: ReactDOM }> = ({ children }) => {
  return <div >
    <ComponentSlot children={children} />
  </div>
}

export default PageContainer;