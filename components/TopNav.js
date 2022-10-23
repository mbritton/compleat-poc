import styles from '@/styles/TopNav.module.scss';
import Link from 'next/link';

const TopNav = ({ pageObjects }) => {
  return (
    <div className={styles.navWrapper}>
      <div className={styles.pageButton}></div>
      {pageObjects.map((page, i) => {
        return (
          <div key={i} className={styles.pageButton}>
            <Link href={page.href}>{page.title}</Link>
          </div>
        );
      })}
    </div>
  );
};

export default TopNav;
