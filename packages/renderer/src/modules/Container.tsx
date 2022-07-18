import { ReactNode } from "react";

const Container: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export default Container;