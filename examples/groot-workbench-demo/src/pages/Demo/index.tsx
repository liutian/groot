import React, { useState } from "react";
import Workbench from "components/Workbench";
import './bootstrap';

import styles from './index.module.less';

const Demo: React.FC = () => {
  const [step, setStep] = useState<'page' | 'approve' | 'publish'>('page');

  return <div className={styles.container}>
    <nav>
      <div onClick={() => setStep('page')} className={`${styles.tabItem} ${step === 'page' ? styles.active : ''}`}>页面搭建</div>
      <div onClick={() => setStep('approve')} className={`${styles.tabItem} ${step === 'approve' ? styles.active : ''}`}>流程配置</div>
      <div onClick={() => setStep('publish')} className={`${styles.tabItem} ${step === 'publish' ? styles.active : ''}`}>页面发布</div>
    </nav>
    <main>
      {step === 'page' && (
        <Workbench instanceId={1} config={{ package: 'grootWorkbench', module: 'Instance', url: 'http://groot-local.com:13000/workbench/index.js', title: '' }} />
      )}
      {step === 'approve' && (
        <Workbench instanceId={2} config={{ package: 'grootWorkbench', module: 'Instance', url: 'http://groot-local.com:13000/workbench/index.js', title: '' }} />
      )}

      {step === 'publish' && (<>
        页面发布
      </>)}
    </main>
  </div>
}

export default Demo;