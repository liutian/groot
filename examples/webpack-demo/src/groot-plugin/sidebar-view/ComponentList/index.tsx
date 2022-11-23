import { Button } from "antd";
import { useState } from "react";
import styles from './index.module.less';

const ComponentList = () => {
  const [tick, setTick] = useState(0);

  const onClick = () => {
    setTick(c => ++c);
  }

  return <div className={styles.container}>
    <Button onClick={onClick}>tick {tick} </Button>
  </div>

}

export default ComponentList;