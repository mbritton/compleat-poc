import styles from '@/styles/TopNav.module.scss';
import Link from 'next/link';

const TopNav = ({ path, pageObjects }) => {
  return (
    <div className={styles.navWrapper}>
      {pageObjects.map((page, index) => {
        return (
          <div
            key={index + 'page'}
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
