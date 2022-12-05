import { ReactElement, useEffect } from "react";
import { ComponentSlot } from "./ComponentSlot";

type PropsType = {
  title: string,
  content: ReactElement[]
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