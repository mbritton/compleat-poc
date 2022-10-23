import styles from '@/styles/TopNav.module.scss';
import { useEffect, useState } from 'react';

const TopNav = ({ pageObjects }) => {
  return (
    <div className={styles.navWrapper}>
      <div className={styles.pageButton}></div>
      {pageObjects.map((page, i) => {
        return (
          <div key={i} className={styles.pageButton}>
            {page.title}
          </div>
        );
      })}
    </div>
  );
};

export default TopNav;
