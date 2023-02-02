import Studio from "Studio";
import type { StudioParams } from "typings";

type PropsType = {
  account: any,

  params: StudioParams
}

const App: React.FC<PropsType> = ({ params }) => {

  return <Studio {...params} />
}


export default App;