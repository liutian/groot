import { useRegisterModel } from "@grootio/common";
import { useState } from "react";
import { ActivityBarModel } from "./ActivityBarModel";

const ActivityBar: React.FC = () => {
  const model = useRegisterModel(ActivityBarModel);
  const [list] = useState(['dffdfdfd'])

  return <>
    <button onClick={() => model.say()}>say</button>
    {model.word}
    {model.list.map((item, index) => {
      return <div key={index}>{item}</div>
    })}
    {model.demo.text}
  </>
}

export default ActivityBar;