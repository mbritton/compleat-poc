import styles from '@/styles/TopNav.module.scss';
import Link from 'next/link';
import Tools from '@/components/Tools';

const TopNav = ({ path, pageObjects }) => {
  return (
    <div className={styles.navWrapper}>
      <Tools />
    <div className={styles.pageButtonsWrapper}>
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
    </div>
  );
};

export default TopNav;
