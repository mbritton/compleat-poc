import styles from '@/styles/TopNav.module.scss';
import Link from 'next/link';

const TopNav = ({ path, pageObjects }) => {
  return (
    <div className={styles.navWrapper}>
      <div className={styles.pageButton}></div>
      {pageObjects.map((page, i) => {
        return (
          <div
            key={i + 'page'}
            className={
              page.href === path ? styles.pageButton : styles.pageButtonDim
            }
          >
            <Link href={page.href}>{page.title}</Link>
          </div>
        );
      })}
    </div>
  );
};

export default TopNav;
