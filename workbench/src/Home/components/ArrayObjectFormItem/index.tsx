import Studio from "@model/Studio";
import { useModel } from "@util/robot";
import { Button } from "antd";

type PropsType = {
  item: CodeMetaStudioPropItem,
  value?: any[],
  onChange?: (value: any[]) => void;
}

const ArrayObjectFormItem: React.FC<PropsType> = ({ item }) => {
  const [model] = useModel<Studio>('studio');
  return <>
    <Button block onClick={() => model.pushHandUpStudioItem(item)}>对象数组{item.valueOfArrayObject?.length}</Button>
  </>
}

export default ArrayObjectFormItem;