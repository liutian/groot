import StudioModel from "@model/StudioModel";
import { useModel } from "@util/robot";
import { Button } from "antd";

type PropsType = {
  item: PropItem,
  value?: any[],
  onChange?: (value: any[]) => void;
}

const PropItemStudioForArray: React.FC<PropsType> = ({ item }) => {
  const [model] = useModel<StudioModel>('studio');
  return <>
    <Button block onClick={() => model.pushHandUpPropItem(item)}>对象数组{item.valueOfGroup?.propBlockList?.length}</Button>
  </>
}

export default PropItemStudioForArray;