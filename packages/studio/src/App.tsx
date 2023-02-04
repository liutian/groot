import { StudioParams } from "@grootio/common";
import { LocalAPIPath } from "api/API.path";
import { useEffect, useState } from "react";
import Studio from "Studio";
import request from "util/request";

// 处理布局和路由，加载账户信息包括组织架构
const App: React.FC<StudioParams> = (props) => {
  const [account, setAccount] = useState<any>();

  useEffect(() => {
    request(LocalAPIPath.account).then(() => {
      setAccount({});
    })
  }, []);

  return <>{account ? <Studio {...props} account={account} /> : null}</>
}


export default App;