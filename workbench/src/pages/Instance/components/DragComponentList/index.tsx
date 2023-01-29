import { APIPath, Component } from "@grootio/common";
import { useEffect, useState } from "react";

import request from "@util/request";

import { DragComponent } from "../DragComponent";
import styles from './index.module.less';

export const DragComponentList: React.FC = () => {
  const [componentList, setComponentList] = useState<Component[]>([]);

  useEffect(() => {
    request(APIPath.component_list).then(({ data }) => {
      setComponentList(data);
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