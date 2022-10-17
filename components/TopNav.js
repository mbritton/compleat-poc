import styles from '@/styles/TopNav.module.scss';
import { BsSearch, BsArrowRight } from 'react-icons/bs';

const TopNav = ({ children }) => {
  return (
    <div className={styles.navWrapper}>
      <div className={styles.searchWrapper}>
        <BsSearch className={styles.icon}></BsSearch>
      </div>
      <div className={styles.pageButton}></div>
      <div className={styles.pageButton}>Page</div>
      <div className={styles.pageButton}>Page</div>
      <div className={styles.pageButton}>Page</div>
      <div className={styles.pageButton}>Page</div>
    </div>
  );
};

export default TopNav;
