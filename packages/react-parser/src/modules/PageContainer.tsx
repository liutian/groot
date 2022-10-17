import { ReactNode, useEffect } from "react";
import { ComponentSlot } from "./ComponentSlot";

type PropsType = {
  title: string,
  content: ReactNode[]
}

const PageContainer: React.FC<PropsType> = ({ title, content }) => {
  useEffect(() => {
    document.title = title;
  }, []);

  return < >
    <ComponentSlot children={content} />
  </>
}

export default PageContainer;