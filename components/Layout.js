import TopNav from '@/components/TopNav';
import styles from '@/styles/Layout.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { brandingLogo } from '../media';
import { brandingLogoSmall } from '../media';

const Layout = ({ pages, children }) => {
  const [pageObj] = useState(JSON.parse(pages));
  const router = useRouter();

  const outputLogo = useCallback(() => {
    const isHome = router.asPath === '/';
    return (
      <div className={isHome ? styles.logoHeader : styles.logoHeader}>
        <Image
          src={isHome ? brandingLogoSmall : brandingLogoSmall}
          width={287}
          height={86}
          alt="Compleat Stair Logo"
        />
      </div>
    );
  },[router]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.topBrand}></div>
        <TopNav path={router.asPath} pageObjects={pageObj.pages}></TopNav>
      </div>
      {outputLogo()}
      <main className={styles.main}>{children}</main>
      <div className={styles.footer}></div>
    </div>
  );
};

export default Layout;
