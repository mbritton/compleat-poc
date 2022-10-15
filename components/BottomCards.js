import styles from '@/styles/BottomCards';

const BottomCards = ({ children }) => {
  return (
    <div className={styles.heroBottomCards}>
      <div className={styles.card}></div>
      <div className={styles.card}></div>
      <div className={styles.card}></div>
      <div className={styles.card}></div>
    </div>
  );
};

export default BottomCards;
