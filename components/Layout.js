import TopNav from '@/components/TopNav';
import styles from '@/styles/Layout.module.scss';
import { useState } from 'react';

const Layout = ({ pages, children }) => {
  const [pageObj] = useState(JSON.parse(pages));
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.topBrand}></div>
        <TopNav pageObjects={pageObj.pages}></TopNav>
      </div>

      <main className={styles.main}>{children}</main>
      <div className={styles.footer}></div>
    </div>
  );
};

export default Layout;
