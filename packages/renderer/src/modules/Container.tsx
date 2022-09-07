import { ReactNode } from "react";
import { DragSlot } from "./DragSlot";

const Container: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100px' }}>
    {children}
    <DragSlot name="children" />
  </div>
}

export default Container;