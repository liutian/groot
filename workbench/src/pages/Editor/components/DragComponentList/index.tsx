import { serverPath } from "config";
import { useEffect, useState } from "react";
import { DragComponent } from "../DragComponent";
import styles from './index.module.less';

export const DragComponentList: React.FC = () => {
  const [componentList, setComponentList] = useState<Component[]>([]);

  useEffect(() => {
    fetch(`${serverPath}/component/list?container=false`).then(res => res.json()).then(({ data: list }: { data: Component[] }) => {
      setComponentList(list);
    })
  }, []);

  return <div className={styles.container}>
    {
      componentList.map((component) => {
        return <DragComponent component={component} key={component.id} />
      })
    }
  </div>
}