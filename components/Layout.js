import TopNav from '@/components/TopNav';
import styles from '@/styles/Layout.module.scss';
import Image from 'next/image';
import { useState } from 'react';
import { brandingLogo } from '../media';

const Layout = ({ pages, children }) => {
  const [pageObj] = useState(JSON.parse(pages));
  const outputLogo = () => {
    return (
      <div className={styles.logoDefault}>
        <Image src={brandingLogo} width={287} height={86} alt="LOGO" />
      </div>
    );
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.topBrand}></div>
        <TopNav pageObjects={pageObj.pages}></TopNav>
      </div>
      {outputLogo()}
      <main className={styles.main}>{children}</main>
      <div className={styles.footer}></div>
    </div>
  );
};

export default Layout;
