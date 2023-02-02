import { StudioParams } from "@grootio/common";
import Studio from "./Studio";

type PropsType = {
  account: any,

  params: StudioParams
}

// 处理布局和路由
const App: React.FC<PropsType> = ({ params }) => {

  return <Studio {...params} />
}


export default App;