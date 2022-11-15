import styles from './index.module.less';

const Loading: React.FC<{ text: string }> = ({ text }) => {
  return <div className={styles.container}>{text}</div>
}

export default Loading;