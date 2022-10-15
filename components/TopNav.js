import styles from '@/styles/TopNav.module.scss';

const TopNav = ({ children }) => {
  return (
    <div className={styles.navWrapper}>
      <div className={styles.pageButton}>Page</div>
      <div className={styles.pageButton}>Page</div>
      <div className={styles.pageButton}>Page</div>
      <div className={styles.pageButton}>Page</div>
    </div>
  );
};

export default TopNav;
