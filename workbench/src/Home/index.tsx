import { useState } from 'react';
import styles from './index.module.less';

function Home() {
  const [pageUrl] = useState('http://192.168.31.39:8888/admin/groot/page1');

  return <div className={styles.main}>
    <iframe className={styles.page} src={pageUrl}></iframe>
    <div className={styles.setting}>
      <div className={styles.sideEdge}></div>
    </div>
  </div>
}

export default Home;